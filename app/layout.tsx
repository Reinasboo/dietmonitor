import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mindful — Private Food Logging',
  description: 'No judgment, just awareness. A private food logging app.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🧠</text></svg>',
  },
  openGraph: {
    title: 'Mindful — Private Food Logging',
    description: 'No judgment, just awareness. Track your food mindfully and discover patterns in your eating habits.',
    url: 'https://mindful.vercel.app',
    siteName: 'Mindful',
    images: [
      {
        url: '/og-image',
        width: 1200,
        height: 630,
        alt: 'Mindful Food Logger - Private Food Tracking',
        type: 'image/png',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mindful — Private Food Logging',
    description: 'No judgment, just awareness. Track your food mindfully.',
    images: ['/og-image'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-gray-900 antialiased">
        <div className="min-h-screen">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-lilac-200/30 blur-3xl" />
            <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-gold-200/20 blur-3xl" />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
