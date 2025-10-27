import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PreloaderProvider } from '@/contexts/PreloaderContext';
import { AnimationProvider } from '@/contexts/AnimationContext';

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
            {children}
          </AnimationProvider>
        </PreloaderProvider>
      </body>
    </html>
  );
}