import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unoffizieller Eventkalender Österreich",
  description: "Entdecke Konzerte, Theater, Partys und mehr in deiner Umgebung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-6 md:px-8 md:py-0 border-t">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by Simulation Laboratories.
              </p>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
