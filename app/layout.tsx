import { ThemeSwitcher } from "@/components/theme-switcher";
import { Rubik } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "@/styles/globals.scss";
import { Toaster } from 'sonner';
import { NavigationProgress } from "@/components/ui/nprogress";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ms-agent.ai in Next.js",
  description: "Your AI assistant for all your needs",
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
                  {children}
                </div>
            </main>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
  );
}
