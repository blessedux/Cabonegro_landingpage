import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {/* Development Navigation - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 right-4 z-50 bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg border border-gray-700 space-y-1">
            <a 
              href="/preloader-test" 
              className="block text-white text-sm hover:text-blue-400 transition-colors"
            >
              🧪 Terminal Preloader
            </a>
            <a 
              href="/layout-preloader-test" 
              className="block text-white text-sm hover:text-blue-400 transition-colors"
            >
              🎨 Layout Preloader
            </a>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}