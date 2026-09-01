import type { Pack } from '@/types';

export const packs: Pack[] = [
  {
    id: 'single',
    name: 'SINGLE',
    count: '1 BOTTLE',
    description: 'One bottle, one flavour. The way to find out where you stand.',
    price: '₹180',
    contents: ['Any one flavour', '330 ml glass'],
    media: '/assets/product/pack-single.svg',
  },
  {
    id: 'multi',
    name: 'MULTI-PACK',
    count: '6 BOTTLES',
    description: 'Six of the one you already know you want.',
    price: '₹990',
    contents: ['Six of one flavour', 'Returnable crate'],
    media: '/assets/product/pack-multi.svg',
  },
  {
    id: 'mixed',
    name: 'MIXED PACK',
    count: '6 BOTTLES',
    description: 'The whole range, one of each. For people who cannot decide.',
    price: '₹1,050',
    contents: ['One of every flavour', 'Returnable crate', 'Tasting card'],
    media: '/assets/product/pack-mixed.svg',
    featured: true,
  },
  {
    id: 'gift',
    name: 'GIFT PACK',
    count: '4 BOTTLES',
    description: 'Four bottles in a printed box, with a hand-numbered batch card.',
    price: '₹860',
    contents: ['Four chosen flavours', 'Printed box', 'Hand-numbered card'],
    media: '/assets/product/pack-gift.svg',
  },
];
