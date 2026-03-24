import type { Metadata } from "next";
import { Vollkorn_SC, Jost, JetBrains_Mono } from "next/font/google";
import ConvexClientProvider from "./convex-client-provider";
import Link from "next/link";
import "./globals.css";

const vollkornSC = Vollkorn_SC({
  variable: "--font-vollkorn-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trace",
  description: "AI Safety Giving Database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${vollkornSC.variable} ${jost.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-warm-200 px-6 py-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-baseline gap-4">
              <Link href="/" className="font-logo text-2xl tracking-wide text-warm-900 hover:text-warm-700 transition-colors">
                Trace
              </Link>
              <span className="text-sm text-warm-400 font-body tracking-wide uppercase hidden sm:inline">
                AI Safety Giving Database
              </span>
            </div>
            <nav className="flex items-baseline gap-6">
              <Link href="/" className="text-sm text-warm-500 hover:text-warm-800 transition-colors">
                Organizations
              </Link>
              <Link href="/funds" className="text-sm text-warm-500 hover:text-warm-800 transition-colors">
                Funds
              </Link>
            </nav>
          </div>
        </header>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
