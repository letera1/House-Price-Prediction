import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'House Price Predictor',
  description: 'Predict California house prices using machine learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
