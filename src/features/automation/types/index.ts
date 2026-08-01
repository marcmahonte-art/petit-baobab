// src/features/automation/types/index.ts
export enum AutomationEvent {
  USER_REGISTERED = 'USER_REGISTERED',
  EMAIL_CONFIRMED = 'EMAIL_CONFIRMED',
  LOGIN = 'LOGIN',
  CHILD_CREATED = 'CHILD_CREATED',
  LEVEL_UP = 'LEVEL_UP',
  BADGE_UNLOCKED = 'BADGE_UNLOCKED',
  MISSION_COMPLETED = 'MISSION_COMPLETED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  BOOK_CREATED = 'BOOK_CREATED',
  BOOK_DOWNLOADED = 'BOOK_DOWNLOADED',
  MAGIC_DRAWING_CREATED = 'MAGIC_DRAWING_CREATED',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_RENEWED = 'SUBSCRIPTION_RENEWED',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  FREE_PLAN_LIMIT_REACHED = 'FREE_PLAN_LIMIT_REACHED',
  SCHOOL_CREATED = 'SCHOOL_CREATED',
  CLASS_CREATED = 'CLASS_CREATED',
  STUDENT_JOINED = 'STUDENT_JOINED',
  TEACHER_INVITED = 'TEACHER_INVITED',
  CERTIFICATE_EARNED = 'CERTIFICATE_EARNED',
  STREAK_COMPLETED = 'STREAK_COMPLETED',
  DAILY_REWARD_AVAILABLE = 'DAILY_REWARD_AVAILABLE',
  WORLD_GROWN = 'WORLD_GROWN'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH'
}

export enum Priority {
  URGENT = 'URGENT',
  IMPORTANT = 'IMPORTANT',
  NORMAL = 'NORMAL',
  SILENT = 'SILENT'
}

export interface AutomationAction {
  channel: NotificationChannel;
  templateId: string;
  payload?: Record<string, any>;
  // optional custom handler name for non‑notification actions
  handler?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger_event: AutomationEvent;
  conditions?: any; // JSON structure evaluated by condition engine
  actions: AutomationAction[];
  enabled: boolean;
  priority: Priority;
  created_at: string;
}
