import type { UsageCounters, User } from '@/src/lib/api/types';

export type Session = {
  token: string;
  expiresAt: string | null;
  user: User;
  supportedMarketplaces: { id: string; label: string }[];
  usage: UsageCounters;
  limits: UsageCounters;
};

export const zeroUsage: UsageCounters = {
  ai_drafts: 0,
  background_removals: 0,
  lifestyle: 0,
  price_research: 0,
};

export const emptySession: Session = {
  token: '',
  expiresAt: null,
  user: {
    id: 0,
    email: '',
    confirmed_at: null,
    selected_marketplaces: [],
    plan: null,
    plan_status: null,
    plan_period: null,
    plan_expires_at: null,
    trial_ends_at: null,
    addon_credits: {},
  },
  supportedMarketplaces: [],
  usage: zeroUsage,
  limits: zeroUsage,
};
