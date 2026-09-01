import type { QuizQuestion } from '@/types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'feeling',
    index: '01',
    question: 'WHAT ARE YOU FEELING?',
    options: [
      {
        id: 'fresh',
        label: 'Fresh',
        sub: 'Something sharp and cold',
        weights: { 'ginger-lime': 3, lychee: 2, original: 1 },
      },
      {
        id: 'fruity',
        label: 'Fruity',
        sub: 'Ripe, loud, generous',
        weights: { mango: 3, berry: 2, nannari: 1 },
      },
      {
        id: 'floral',
        label: 'Floral',
        sub: 'Perfumed and pale',
        weights: { lychee: 3, nannari: 1, mango: 1 },
      },
      {
        id: 'bold',
        label: 'Bold',
        sub: 'Dark and tannic',
        weights: { berry: 3, original: 2, nannari: 2 },
      },
    ],
  },
  {
    id: 'adventure',
    index: '02',
    question: 'HOW ADVENTUROUS?',
    options: [
      {
        id: 'classic',
        label: 'Classic',
        sub: 'Give me the house pour',
        weights: { original: 3, mango: 2 },
      },
      {
        id: 'curious',
        label: 'Curious',
        sub: 'Surprise me, gently',
        weights: { mango: 2, lychee: 2, berry: 2 },
      },
      {
        id: 'experimental',
        label: 'Experimental',
        sub: 'Take me somewhere strange',
        weights: { nannari: 3, 'ginger-lime': 3, lychee: 1 },
      },
    ],
  },
];
