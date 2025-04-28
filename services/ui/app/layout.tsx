import { Metadata } from 'next';
import './globals.css';
import AppHeader from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'Mercari Scraper',
  description: 'This website shows the scraped data from Mercari',
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-950 text-white">
      <body className="min-h-dvh">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
