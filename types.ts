
export const DEFAULT_CATEGORIES = ['Entertainment', 'Gaming', 'Education', 'Fitness', 'News', 'Work', 'Utility', 'Lifestyle', 'Other'];

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  renewalDate: string; // ISO string
  startDate: string; // ISO string
  endDate: string; // ISO string
  reminderDays: number;
  category: string;
  color: string;
  logoUrl?: string;
  isArchived?: boolean;
  soundTone?: string;
}

export interface AppState {
  subscriptions: Subscription[];
  customCategories: string[];
  notificationPermission: NotificationPermission;
}
