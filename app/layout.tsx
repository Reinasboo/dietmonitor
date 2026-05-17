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
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
