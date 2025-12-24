import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Profile } from '@/types/database';
import { useAuth } from './useAuth';

export const useMessages = () => {
  const { user, isApproved } = useAuth();
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [starred, setStarred] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Message[]>([]);
  const [trash, setTrash] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!user || !isApproved) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch inbox messages (received, not deleted, not draft)
      const { data: inboxData } = await supabase
        .from('messages')
        .select(`*, sender:profiles!messages_sender_id_fkey(*)`)
        .eq('receiver_id', user.id)
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (inboxData) {
        const typedInbox = inboxData.map(msg => ({
          ...msg,
          sender: msg.sender as Profile,
        })) as Message[];
        setInbox(typedInbox);
        setUnreadCount(typedInbox.filter(m => m.status !== 'seen').length);
      }

      // Fetch sent messages (sent by user, not deleted, not draft)
      const { data: sentData } = await supabase
        .from('messages')
        .select(`*, receiver:profiles!messages_receiver_id_fkey(*)`)
        .eq('sender_id', user.id)
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (sentData) {
        setSent(sentData.map(msg => ({
          ...msg,
          receiver: msg.receiver as Profile,
        })) as Message[]);
      }

      // Fetch starred messages
      const { data: starredData } = await supabase
        .from('messages')
        .select(`*, sender:profiles!messages_sender_id_fkey(*), receiver:profiles!messages_receiver_id_fkey(*)`)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('is_starred', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (starredData) {
        setStarred(starredData.map(msg => ({
          ...msg,
          sender: msg.sender as Profile,
          receiver: msg.receiver as Profile,
        })) as Message[]);
      }

      // Fetch drafts
      const { data: draftsData } = await supabase
        .from('messages')
        .select(`*, receiver:profiles!messages_receiver_id_fkey(*)`)
        .eq('sender_id', user.id)
        .eq('is_draft', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (draftsData) {
        setDrafts(draftsData.map(msg => ({
          ...msg,
          receiver: msg.receiver as Profile,
        })) as Message[]);
      }

      // Fetch trash (deleted messages)
      const { data: trashData } = await supabase
        .from('messages')
        .select(`*, sender:profiles!messages_sender_id_fkey(*), receiver:profiles!messages_receiver_id_fkey(*)`)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });

      if (trashData) {
        setTrash(trashData.map(msg => ({
          ...msg,
          sender: msg.sender as Profile,
          receiver: msg.receiver as Profile,
        })) as Message[]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user || !isApproved) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isApproved, fetchMessages]);

  const sendMessage = async (receiverId: string, subject: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      subject,
      content,
      is_draft: false,
    });

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const saveDraft = async (receiverId: string | null, subject: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId || user.id, // Use own ID if no receiver selected
      subject,
      content,
      is_draft: true,
    });

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const updateDraft = async (messageId: string, receiverId: string | null, subject: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('messages')
      .update({
        receiver_id: receiverId || user.id,
        subject,
        content,
      })
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const sendDraft = async (messageId: string, receiverId: string, subject: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('messages')
      .update({
        receiver_id: receiverId,
        subject,
        content,
        is_draft: false,
      })
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const markAsSeen = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'seen' as const })
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const toggleStarred = async (messageId: string, isStarred: boolean) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_starred: !isStarred })
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const moveToTrash = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const restoreFromTrash = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const permanentlyDelete = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  return {
    inbox,
    sent,
    starred,
    drafts,
    trash,
    isLoading,
    unreadCount,
    sendMessage,
    saveDraft,
    updateDraft,
    sendDraft,
    markAsSeen,
    toggleStarred,
    moveToTrash,
    restoreFromTrash,
    permanentlyDelete,
    refetch: fetchMessages,
  };
};
