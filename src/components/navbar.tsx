"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex gap-4">
          <Link href="/" className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
            inoffizieller Veranstaltungskalender Österreich :)
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
            Startseite
          </Link>
          <Link href="/archiv" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Archiv
          </Link>
          {status === "loading" ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md"></div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {session.user?.name || session.user?.email}
              </span>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              {session.user?.role === "ADMIN" && (
                <Link href="/settings">
                  <Button variant="ghost">Settings</Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                Abmelden
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn()}>
              Anmelden
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
