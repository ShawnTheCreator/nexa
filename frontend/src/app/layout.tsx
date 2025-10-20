'use client';

import Footer from "@/components/ui/Footer";
import { Navigation } from "@/components/ui/Navbar";
import { ThemeProvider } from "next-themes";
import { ChatFloatButton } from '@/components/ChatFloatButton'
import { ChatModal } from '@/components/ChatModal'
import { Inter, Jost } from "next/font/google";
import localFont from "next/font/local";
import { usePathname } from 'next/navigation';
import Script from "next/script";
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css"
        />
      </head>
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
        <Script
          src="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            try {
              const cc = (window as any).cookieconsent;
              if (cc && typeof cc.initialise === 'function') {
                cc.initialise({
                  palette: {
                    popup: { background: '#007bff' },
                    button: { background: '#fff', text: '#007bff' }
                  },
                  theme: 'classic',
                  content: {
                    message: 'We use cookies to improve your experience.',
                    dismiss: 'Got it!',
                    link: 'Learn more',
                    href: '/privacy'
                  },
                  onInitialise: function () {
                    const popup = document.querySelector('.cc-window') as HTMLElement | null;
                    if (popup) {
                      popup.style.position = 'fixed';
                      popup.style.top = '50%';
                      popup.style.left = '50%';
                      popup.style.transform = 'translate(-50%, -50%)';
                      popup.style.width = 'auto';
                      popup.style.maxWidth = '90%';
                      popup.style.zIndex = '10000';
                    }
                  }
                });
              }
            } catch {}
          }}
        />
      </body>
    </html>
  );
}
