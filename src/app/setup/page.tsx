"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Database, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dbUrl, setDbUrl] = useState("postgresql://postgres:postgres@localhost:5432/eventsdb?schema=public");
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");

  const handleSetup = async () => {
    if (!dbUrl || !adminUsername || !adminPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl, adminUsername, adminPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(3);
        toast.success("Setup completed successfully!");
      } else {
        toast.error(data.error || "Setup failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-xl bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">System Setup</h1>
            <p className="text-muted-foreground">Configure your environment to get started.</p>
          </div>

          {/* Stepper */}
          <div className="flex justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <Database className="w-5 h-5" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="w-8 h-px bg-border my-auto"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Admin</span>
            </div>
            <div className="w-8 h-px bg-border my-auto"></div>
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Done</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dbUrl">PostgreSQL Connection URL</Label>
                  <Input 
                    id="dbUrl" 
                    value={dbUrl} 
                    onChange={(e) => setDbUrl(e.target.value)}
                    placeholder="postgresql://user:pass@host:5432/db?schema=public"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ensure the database exists and Prisma migrations have been run (`npx prisma db push`).
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>Next Step</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUser">Admin Username</Label>
                  <Input 
                    id="adminUser" 
                    value={adminUsername} 
                    onChange={(e) => setAdminUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPass">Admin Password</Label>
                  <Input 
                    id="adminPass" 
                    type="password"
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleSetup} disabled={loading}>
                  {loading ? "Configuring..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 animate-in zoom-in-95">
              <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">All Set!</h2>
                <p className="text-muted-foreground">Your database is connected and your admin account is ready.</p>
              </div>
              <Button onClick={() => {
                // Hard refresh to reload server components layout
                window.location.href = "/";
              }} className="w-full">
                Go to Homepage
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
