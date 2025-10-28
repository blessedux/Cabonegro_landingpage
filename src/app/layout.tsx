import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PreloaderProvider } from '@/contexts/PreloaderContext';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { CookieBannerProvider } from '@/contexts/CookieBannerContext';
import { ThemeProvider } from 'next-themes';

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PreloaderProvider>
            <AnimationProvider>
              <CookieBannerProvider>
                {children}
              </CookieBannerProvider>
            </AnimationProvider>
          </PreloaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}