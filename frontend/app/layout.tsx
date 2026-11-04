import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PropVal AI | California House Price Valuation Engine',
  description: 'Enterprise machine learning system for precision California residential property valuation, featuring real-time inference, mock-up scales, and developer telemetry.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f8' },
    { media: '(prefers-color-scheme: dark)', color: '#121316' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>{children}</body>
    </html>
  );
}
