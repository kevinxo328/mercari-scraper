import { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Mercari Scraper",
  description: "This website shows the scraped data from Mercari",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh flex flex-col">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
