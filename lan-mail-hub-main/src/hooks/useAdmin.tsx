import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserStatus } from '@/types/database';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { isAdmin } = useAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setAllUsers(data as Profile[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchUsers]);

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (!error) {
      await fetchUsers();
    }

    return { error };
  };

  const approveUser = (userId: string) => updateUserStatus(userId, 'approved');
  const rejectUser = (userId: string) => updateUserStatus(userId, 'rejected');
  const suspendUser = (userId: string) => updateUserStatus(userId, 'suspended');

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (!error) {
      await fetchUsers();
    }

    return { error };
  };

  // Derived states
  const pendingUsers = allUsers.filter(u => u.status === 'pending');
  const approvedUsers = allUsers.filter(u => u.status === 'approved');
  const rejectedUsers = allUsers.filter(u => u.status === 'rejected');
  const suspendedUsers = allUsers.filter(u => u.status === 'suspended');

  return {
    allUsers,
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    suspendedUsers,
    isLoading,
    approveUser,
    rejectUser,
    suspendUser,
    deleteUser,
    refetch: fetchUsers,
  };
};
