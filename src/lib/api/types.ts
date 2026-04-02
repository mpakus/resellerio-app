export type SupportedMarketplace = {
  id: string;
  label: string;
};

export type User = {
  id: number;
  email: string;
  confirmed_at: string | null;
  selected_marketplaces: string[];
  plan: string | null;
  plan_status: string | null;
  plan_period: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
  addon_credits: Record<string, number>;
};

export type AuthResponse = {
  data: {
    token: string;
    token_type: string;
    expires_at: string;
    user: User;
    supported_marketplaces: SupportedMarketplace[];
  };
};

export type MeResponse = {
  data: {
    user: User;
    supported_marketplaces: SupportedMarketplace[];
  };
};

export type UsageResponse = {
  data: {
    usage: UsageCounters;
    limits: UsageCounters;
    addon_credits: Record<string, number>;
  };
};

export type UsageCounters = {
  ai_drafts: number;
  background_removals: number;
  lifestyle: number;
  price_research: number;
};

export type ValidationFields = Record<string, string[]>;

export type ApiErrorPayload =
  | {
      error?: {
        code?: string;
        detail?: string;
        status?: number;
        fields?: ValidationFields;
      };
    }
  | {
      error?: string;
      detail?: string;
      status?: number;
      operation?: string;
      used?: number;
      limit?: number;
      upgrade_url?: string;
    };
