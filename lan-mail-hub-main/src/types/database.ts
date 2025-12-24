export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type AppRole = 'admin' | 'user';
export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface Profile {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  status: MessageStatus;
  is_starred: boolean;
  is_draft: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}
