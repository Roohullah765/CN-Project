-- Add suspended to user_status enum
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'suspended';

-- Add new columns to messages table for drafts, starred, and trash
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_starred boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_is_starred ON public.messages(is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_draft ON public.messages(is_draft) WHERE is_draft = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted) WHERE is_deleted = true;

-- Update RLS policy for drafts (sender can see their own drafts)
CREATE POLICY "Users can view own drafts" 
ON public.messages 
FOR SELECT 
USING (sender_id = auth.uid() AND is_draft = true);

-- Update RLS policy for deleted messages
CREATE POLICY "Users can view own deleted messages" 
ON public.messages 
FOR SELECT 
USING ((sender_id = auth.uid() OR receiver_id = auth.uid()) AND is_deleted = true);

-- Allow users to update starred/deleted status on their messages
CREATE POLICY "Users can update message flags" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid() OR receiver_id = auth.uid());