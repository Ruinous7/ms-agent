import { ThemeSwitcher } from "@/components/theme-switcher";
import { Rubik } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "@/styles/globals.scss";
import { Toaster } from 'sonner';
import { NavigationProgress } from "@/components/ui/nprogress";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { Suspense } from "react";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ms-agent.ai in Next.js",
  description: "Your AI assistant for all your needs",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MS-Agent.ai",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192x192.png"],
    apple: [
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

const rubik = Rubik({
  subsets: ['latin', 'hebrew'],
  display: 'swap',
  variable: '--font-rubik',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={rubik.className} suppressHydrationWarning>
        <head>
          <meta name="application-name" content="MS-Agent.ai" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="MS-Agent.ai" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/icons/apple-icon-180x180.png" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </head>
        <body className="bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationProgress />
            <main>
                <nav className="main-nav-bar w-full flex border-b border-b-foreground/10 h-16 sticky top-0 bg-background z-10">
                  <div className="w-full flex justify-between items-center p-3 px-7 text-sm">
                    <div className="flex gap-5 items-center font-semibold">
                      <Link className="text-xl" href={"/"}>ms-agent.ai</Link>
                    </div>
                    <div>
                      <ThemeSwitcher />
                    </div>
                  </div>
                </nav>
                <div id="main-inner-wrapper" className="flex flex-col">
                  <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                    {children}
                  </Suspense>
                </div>
            </main>
            <PWAInstallPrompt />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
  );
}
