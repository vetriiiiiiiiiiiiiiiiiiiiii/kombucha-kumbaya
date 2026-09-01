/**
 * KUMBAYAH — content model
 *
 * Every visual section reads from these shapes. Nothing is hard-coded into a
 * component, so each collection below maps 1:1 onto a CMS collection later
 * (Sanity / Payload / Contentful). Media is referenced by path only — swapping
 * in real photography is a data edit, not a code edit.
 */

export interface Swatch {
  /** primary accent — used for type, rules and glow */
  accent: string;
  /** deep tone — used for wells and gradients */
  deep: string;
}

export interface TasteProfile {
  sweet: number;
  tart: number;
  fizz: number;
  depth: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** short shelf name, e.g. "Mango" */
  flavour: string;
  tagline: string;
  description: string;
  /** taste descriptors only — never ingredient or health claims */
  notes: string[];
  profile: TasteProfile;
  serve: string;
  size: string;
  colour: Swatch;
  media: {
    bottle: string;
    macro: string;
  };
  order: number;
  available: boolean;
  badge?: string;
}

export interface FermentStage {
  id: string;
  day: string;
  title: string;
  caption: string;
  body: string;
  /** 0–1 progress of the brew, drives the liquid + particle sim */
  progress: number;
  colour: Swatch;
  media: string;
}

export interface QuizOption {
  id: string;
  label: string;
  sub: string;
  /** product ids this answer nudges toward */
  weights: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  index: string;
  question: string;
  options: QuizOption[];
}

export interface Person {
  id: string;
  name: string;
  role: string;
  quote?: string;
  media: string;
  /** editorial column span on the rail */
  scale: 'sm' | 'md' | 'lg';
}

export interface CultureItem {
  id: string;
  category: 'MUSIC' | 'FOOD' | 'CAFÉS' | 'ART' | 'COMMUNITY';
  title: string;
  place: string;
  year: string;
  media: string;
  /** collage placement */
  span: 'tall' | 'wide' | 'square';
}

export interface CycleStep {
  id: string;
  index: string;
  title: string;
  body: string;
}

export interface Venue {
  id: string;
  name: string;
  type: 'CAFÉ' | 'RESTAURANT' | 'RETAIL' | 'STUDIO';
  area: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  /** normalised map coordinates, 0–100 within the India plate */
  x: number;
  y: number;
  status: 'LIVE' | 'SOON';
  count: number;
  venues: Venue[];
}

export interface JournalPost {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  media: string;
  /** editorial weight on the asymmetric grid */
  feature: 'lead' | 'wide' | 'column' | 'quiet';
}

export interface Pack {
  id: string;
  name: string;
  count: string;
  description: string;
  price: string;
  contents: string[];
  media: string;
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  context: string;
}

export interface Campaign {
  id: string;
  name: string;
  line: string;
  active: boolean;
}
