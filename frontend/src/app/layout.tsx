'use client';

import Footer from "@/components/ui/Footer";
import { Navigation } from "@/components/ui/Navbar";
import { ThemeProvider } from "next-themes";
import { ChatFloatButton } from '@/components/ChatFloatButton'
import { ChatModal } from '@/components/ChatModal'
import { Inter, Jost } from "next/font/google";
import localFont from "next/font/local";
import { usePathname } from 'next/navigation';
import "./globals.css";

const authPages = ['/auth/login', '/auth/register', '/auth/reset'];
const dashboardPages = ['/overview', '/ideas', '/voting', '/settings', '/support', '/assistant', '/chat', '/admin'];

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);
  const isDashboardPage = dashboardPages.some((p) => pathname.startsWith(p));

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${inter.variable} ${jost.variable} ${geistSans.variable} ${geistMono.variable} min-h-screen scroll-auto antialiased h-full selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950 ${!(isAuthPage || isDashboardPage) ? 'font-jost' : ''}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          {/* Navigation visible only on non-auth, non-dashboard pages */}
          {!isAuthPage && !isDashboardPage && <Navigation />}
          {isDashboardPage && <ChatFloatButton />}
          {isDashboardPage && <ChatModal />}
          {children}
          {!isAuthPage && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  );
}
