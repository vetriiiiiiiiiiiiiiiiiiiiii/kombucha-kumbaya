import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/system/Providers';

/* Display: characterful, wide, slightly imperfect — nothing default about it. */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  weight: ['500', '700', '800'],
});

const sans = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
  weight: ['300', '400', '500'],
});

/* Used sparingly — the human aside inside an otherwise structural system. */
const serif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
  weight: '400',
  style: ['normal', 'italic'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kumbayah.example'),
  title: {
    default: 'Kumbayah Kombucha — Let Life Bubble',
    template: '%s — Kumbayah',
  },
  description:
    'Real tea. Real fermentation. Real flavour. Kumbayah is kombucha brewed over thirty days in Chennai. A digital experience concept by Lumio Digital.',
  applicationName: 'Kumbayah',
  authors: [{ name: 'Lumio Digital' }],
  keywords: ['kombucha', 'fermentation', 'Kumbayah', 'booch', 'Chennai', 'Lumio Digital'],
  openGraph: {
    title: 'Kumbayah Kombucha — Let Life Bubble',
    description:
      'Kombucha made through real fermentation, patience and flavour. A concept experience by Lumio Digital.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#080604',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
