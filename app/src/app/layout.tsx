import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kavodax",
  description: "Cross-border payments",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: '/Kavodax-Round-Logo.png',
    apple: '/Kavodax-Round-Logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Kavodax-Round-Logo.png" />
        <link rel="apple-touch-icon" href="/Kavodax-Round-Logo.png" />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link absolute left-2 top-2 z-50 bg-white text-blue-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-transform -translate-y-16 focus:translate-y-0">
          Skip to main content
        </a>
        <AuthProvider>
          <main id="main-content" tabIndex={-1} role="main">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
