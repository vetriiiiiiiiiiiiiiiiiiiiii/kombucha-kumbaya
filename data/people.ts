import type { Person } from '@/types';

/**
 * PLACEHOLDER PEOPLE — the media paths below hold art-directed placeholder
 * compositions, NOT synthetic portraits. Replace each `media` path with real
 * documentary photography of the team; the layout expects portrait crops
 * (4:5) for `sm`/`md` and a 3:4 crop for `lg`.
 */
export const people: Person[] = [
  {
    id: 'brew-room',
    name: 'The Brew Room',
    role: 'Where the thirty days happen',
    media: '/assets/editorial/people-brew.svg',
    scale: 'lg',
    quote: 'You cannot argue with a culture. You can only give it time.',
  },
  { id: 'bottling', name: 'Bottling', role: 'Filled and capped by hand', media: '/assets/editorial/people-bottling.svg', scale: 'md' },
  { id: 'ferment', name: 'Second Ferment', role: 'Fruit goes in on day twenty', media: '/assets/editorial/people-ferment.svg', scale: 'sm' },
  {
    id: 'quality',
    name: 'Quality',
    role: 'Tasted every day, by people',
    media: '/assets/editorial/people-quality.svg',
    scale: 'md',
    quote: 'Every batch tastes a little different. That is the whole point.',
  },
  { id: 'team', name: 'The Team', role: 'Fifteen of us, one room', media: '/assets/editorial/people-team.svg', scale: 'lg' },
  { id: 'founder', name: 'The Founder', role: 'Started with one jar on a kitchen shelf', media: '/assets/editorial/people-founder.svg', scale: 'md' },
];

export const founderStory = {
  kicker: 'ORIGIN',
  headline: 'It began with one jar, and a great deal of impatience.',
  body: 'Kumbayah started in a home kitchen in Chennai with a single glass jar, a borrowed culture and no plan beyond the next batch. The first year was mostly failure. The recipe that survived was the one that refused to be hurried — thirty days, no shortcuts, no injected fizz. We still brew it that way, in a room where you can hear the bottles settle.',
  signature: 'THE KUMBAYAH BREW ROOM · CHENNAI',
};
