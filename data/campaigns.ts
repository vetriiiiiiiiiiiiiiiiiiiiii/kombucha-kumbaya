import type { Campaign } from '@/types';

export const campaigns: Campaign[] = [
  { id: 'let-life-bubble', name: 'Let Life Bubble', line: 'LET LIFE BUBBLE.', active: true },
  { id: 'thirty-days', name: 'Thirty Days of Patience', line: 'PATIENCE MAKES THE FIZZ.', active: true },
  { id: 'madras-batch', name: 'Madras Batch', line: 'BREWED WHERE IT IS DRUNK.', active: false },
];

export const activeCampaign = campaigns.find((c) => c.active) ?? campaigns[0];
