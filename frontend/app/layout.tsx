import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Load Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-satoshi',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Hackathon Platform | 1337 Events',
    template: '%s | 1337 Events',
  },
  description:
    'Join Africa\'s premier hackathon platform. Compete, collaborate, and create innovative solutions with thousands of developers.',
  keywords: [
    'hackathon',
    'coding competition',
    '1337',
    'Morocco',
    'Africa',
    'developers',
    'programming',
    'tech events',
  ],
  authors: [{ name: '1337 Events', url: 'https://1337.events' }],
  creator: '1337 Events',
  publisher: '1337 Events',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: '1337 Events',
    title: 'Hackathon Platform | 1337 Events',
    description:
      'Join Africa\'s premier hackathon platform. Compete, collaborate, and create innovative solutions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '1337 Events Hackathon Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackathon Platform | 1337 Events',
    description:
      'Join Africa\'s premier hackathon platform. Compete, collaborate, and create.',
    images: ['/og-image.png'],
    creator: '@1337events',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
