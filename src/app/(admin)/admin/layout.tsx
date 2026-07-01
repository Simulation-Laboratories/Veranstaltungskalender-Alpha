import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldIcon, MapPinIcon, UsersIcon, FlagIcon } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <h2 className="font-bold flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-purple-600" />
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <FlagIcon className="w-4 h-4" /> Übersicht
          </Link>
          <Link href="/admin/claims" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <MapPinIcon className="w-4 h-4" /> Location Claims
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <UsersIcon className="w-4 h-4" /> Benutzer
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
