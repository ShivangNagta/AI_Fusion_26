export type UserRole = 'student' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  avatar_url?: string;
}

export interface NavLocation {
  id: string;
  name: string;
  category: 'academic' | 'food' | 'utility' | 'recreation';
  x: number; // Percentage 0-100 on map
  y: number; // Percentage 0-100 on map
  description: string;
  status: 'open' | 'closed' | 'crowded';
}

export interface MailSummary {
  id: string;
  originalSubject: string;
  summary: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'academic' | 'event' | 'admin';
  receivedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  calories: number;
  tags: string[];
}
