import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PreloaderProvider } from '@/contexts/PreloaderContext';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { CookieBannerProvider } from '@/contexts/CookieBannerContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cabonegro Landing Page",
  description: "Industrial development and investment opportunities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PreloaderProvider>
          <AnimationProvider>
            <CookieBannerProvider>
              {children}
            </CookieBannerProvider>
          </AnimationProvider>
        </PreloaderProvider>
      </body>
    </html>
  );
}