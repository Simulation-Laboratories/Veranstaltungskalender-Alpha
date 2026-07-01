import { ReactNode } from "react";
import Link from "next/link";
import { Settings, Shield, Mail, Activity, HardDrive, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { href: "/settings", label: "Overview", icon: Activity },
    { href: "/settings/general", label: "General Settings", icon: Settings },
    { href: "/settings/auth", label: "Authentication", icon: Shield },
    { href: "/settings/emails", label: "Emails", icon: Mail },
    { href: "/settings/backup", label: "Backup & Restore", icon: HardDrive },
    { href: "/settings/delete", label: "Delete Data", icon: Trash2 },
  ];

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Manage your application configuration and data.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
