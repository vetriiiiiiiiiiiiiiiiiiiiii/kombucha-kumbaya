import type { Product } from '@/types';

/**
 * PLACEHOLDER PRODUCT DATA — concept only.
 * Flavour names and taste descriptors are illustrative. No ingredient lists,
 * nutritional or health claims are made anywhere in this prototype.
 * Media paths point at art-directed placeholders in /public/assets/product/
 * and are sized to accept real product photography at the same paths.
 */
export const products: Product[] = [
  {
    id: 'original',
    slug: 'original',
    name: 'Kumbayah Original',
    flavour: 'Original',
    tagline: 'The first one. Still the honest one.',
    description:
      'Black tea, thirty days, nothing hurried. The house pour — tannic, dry and quietly fizzy.',
    notes: ['Steeped black tea', 'Dry finish', 'Soft acidity'],
    profile: { sweet: 32, tart: 68, fizz: 62, depth: 84 },
    serve: 'Cold, straight from the bottle',
    size: '330 ml',
    colour: { accent: '#CE8C3A', deep: '#2A1A0B' },
    media: { bottle: '/assets/product/bottle-original.svg', macro: '/assets/product/macro-original.svg' },
    order: 1,
    available: true,
    badge: 'HOUSE POUR',
  },
  {
    id: 'mango',
    slug: 'mango',
    name: 'Kumbayah Mango',
    flavour: 'Mango',
    tagline: 'Summer, held at the boil point.',
    description:
      'Ripe stone fruit against the tea tannin. Loud on the nose, dry on the finish — the one people meet us through.',
    notes: ['Ripe stone fruit', 'Warm citrus peel', 'Long dry finish'],
    profile: { sweet: 64, tart: 52, fizz: 70, depth: 58 },
    serve: 'Over ice, with a wedge of lime',
    size: '330 ml',
    colour: { accent: '#F0A028', deep: '#3A2205' },
    media: { bottle: '/assets/product/bottle-mango.svg', macro: '/assets/product/macro-mango.svg' },
    order: 2,
    available: true,
    badge: 'MOST POURED',
  },
  {
    id: 'lychee',
    slug: 'lychee',
    name: 'Kumbayah Lychee',
    flavour: 'Lychee',
    tagline: 'Floral, but it bites back.',
    description:
      'Perfumed and pale, with a sharp fermented edge underneath. The most delicate thing we make.',
    notes: ['Perfumed florals', 'White grape', 'Clean bright finish'],
    profile: { sweet: 55, tart: 60, fizz: 78, depth: 40 },
    serve: 'Chilled, in a wine glass',
    size: '330 ml',
    colour: { accent: '#E9A8B6', deep: '#331520' },
    media: { bottle: '/assets/product/bottle-lychee.svg', macro: '/assets/product/macro-lychee.svg' },
    order: 3,
    available: true,
  },
  {
    id: 'berry',
    slug: 'berry',
    name: 'Kumbayah Berry',
    flavour: 'Berry',
    tagline: 'Dark fruit. Darker fizz.',
    description:
      'The deepest pour in the range. Brooding fruit, firm acidity, a finish that lingers past the sip.',
    notes: ['Dark forest fruit', 'Firm acidity', 'Tannic depth'],
    profile: { sweet: 48, tart: 76, fizz: 58, depth: 88 },
    serve: 'Cold, with something smoky on the plate',
    size: '330 ml',
    colour: { accent: '#A32F51', deep: '#2B0D18' },
    media: { bottle: '/assets/product/bottle-berry.svg', macro: '/assets/product/macro-berry.svg' },
    order: 4,
    available: true,
  },
  {
    id: 'nannari',
    slug: 'nannari',
    name: 'Kumbayah Nannari',
    flavour: 'Nannari',
    tagline: 'The South Indian summer, fermented.',
    description:
      'Rooty, cooling and familiar to anyone who grew up with a glass of it. Our most local pour.',
    notes: ['Cooling root', 'Earthy sweetness', 'Soft spice'],
    profile: { sweet: 58, tart: 44, fizz: 54, depth: 76 },
    serve: 'Over crushed ice, at three in the afternoon',
    size: '330 ml',
    colour: { accent: '#B2643C', deep: '#2B160B' },
    media: { bottle: '/assets/product/bottle-nannari.svg', macro: '/assets/product/macro-nannari.svg' },
    order: 5,
    available: true,
    badge: 'MADRAS BATCH',
  },
  {
    id: 'ginger-lime',
    slug: 'ginger-lime',
    name: 'Kumbayah Ginger Lime',
    flavour: 'Ginger Lime',
    tagline: 'Sharp enough to wake the room.',
    description:
      'Heat and acid, pulling in opposite directions. The driest, loudest bottle on the shelf.',
    notes: ['Fresh ginger heat', 'Lime zest', 'Bone dry'],
    profile: { sweet: 26, tart: 88, fizz: 86, depth: 50 },
    serve: 'Very cold, very fast',
    size: '330 ml',
    colour: { accent: '#A9BE55', deep: '#1E2409' },
    media: { bottle: '/assets/product/bottle-ginger-lime.svg', macro: '/assets/product/macro-ginger-lime.svg' },
    order: 6,
    available: true,
  },
];

export const getProduct = (id: string): Product =>
  products.find((p) => p.id === id) ?? products[0];
