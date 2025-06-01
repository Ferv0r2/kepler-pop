export interface EnergyReward {
  amount: number;
  reason: string;
}

export type RewardInfo = { status: 'success' | 'failed' } & EnergyReward;
