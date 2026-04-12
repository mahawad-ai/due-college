import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'due.college — Never miss a college deadline',
  description:
    'Track every college application deadline in one place. Get reminders before ED1, EA, RD, and FAFSA deadlines. Free for high school students.',
  keywords: 'college deadlines, application tracker, ED1, early decision, FAFSA, college applications, high school',
  openGraph: {
    title: 'due.college — Never miss a college deadline',
    description: 'Add your colleges. We handle the rest.',
    url: 'https://due.college',
    siteName: 'due.college',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'due.college — Never miss a college deadline',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'due.college — Never miss a college deadline',
    description: 'Add your colleges. We handle the rest.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
