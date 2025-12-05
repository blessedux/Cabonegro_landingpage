import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PreloaderProvider } from '@/contexts/PreloaderContext';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { CookieBannerProvider } from '@/contexts/CookieBannerContext';
import { ThemeProvider } from 'next-themes';
import FontLoader from '@/components/FontLoader';

const inter = Inter({ subsets: ["latin"] });

// Base URL for Open Graph - update this with your actual domain
const siteUrl = "https://www.cabonegro.cl";

export const metadata: Metadata = {
  title: "Cabo Negro | Real Estate Investment Opportunities in Patagonia",
  description: "Strategic industrial and maritime hub in Patagonia. Discover premier real estate investment opportunities in Punta Arenas, Magallanes. Gateway to Antarctica and the future of green hydrogen infrastructure.",
  keywords: ["Cabo Negro", "Patagonia real estate", "investment opportunities", "Punta Arenas", "Magallanes", "green hydrogen", "industrial development", "maritime terminal", "logistics park"],
  authors: [{ name: "Cabo Negro" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cabo Negro",
    title: "Cabo Negro | Real Estate Investment Opportunities in Patagonia",
    description: "Strategic industrial and maritime hub in Patagonia. Discover premier real estate investment opportunities in Punta Arenas, Magallanes. Gateway to Antarctica and the future of green hydrogen infrastructure.",
    images: [
      {
        url: `${siteUrl}/logos/cabonegro_logo.png`,
        width: 813,
        height: 241,
        alt: "Cabo Negro - Strategic Industrial Hub in Patagonia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cabo Negro | Real Estate Investment Opportunities in Patagonia",
    description: "Strategic industrial and maritime hub in Patagonia. Discover premier real estate investment opportunities in Punta Arenas, Magallanes.",
    images: [`${siteUrl}/logos/cabonegro_logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to font origins for faster loading */}
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        {/* Preload LCP image for faster initial render */}
        <link rel="preload" href="/cabonegro_frame1.webp" as="image" fetchPriority="high" />
        {/* Preload critical CSS - Next.js will handle the actual CSS file */}
      </head>
      <body className={inter.className}>
        <FontLoader />
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