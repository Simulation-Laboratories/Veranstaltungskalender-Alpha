"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { Info } from "lucide-react";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    adminUsername: "admin", adminPassword: "",
    nextauthUrl: "http://localhost:3000"
  });

  useEffect(() => {
    async function load() {
      try {
        const [a, n] = await Promise.all([
          fetch("/api/settings?key=admin_credentials").then(r => r.json()),
          fetch("/api/settings?key=nextauth_url").then(r => r.json())
        ]);
        setConfig({
          adminUsername: a.value?.adminUsername || "admin",
          adminPassword: a.value?.adminPassword || "",
          nextauthUrl: n.value || "http://localhost:3000"
        });
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) toast.success("Saved successfully");
      else toast.error("Failed to save");
    } catch (e) {
      toast.error("Error saving");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">Manage core application settings.</p>
      </div>
      
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">NextAuth URL</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Public Application URL (NextAuth)</Label>
            <a 
              href="https://next-auth.js.org/configuration/options#nextauth_url" 
              target="_blank" 
              rel="noopener noreferrer"
              title="This is the base URL of your site (e.g., https://events.example.com). It's required for social logins to construct callback URLs correctly."
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
            </a>
          </div>
          <Input value={config.nextauthUrl} onChange={(e) => setConfig({...config, nextauthUrl: e.target.value})} placeholder="https://events.example.com" />
        </div>
        <Button onClick={() => handleSave('nextauth_url', config.nextauthUrl)} disabled={saving}>Save URL</Button>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Fallback Admin Credentials</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Admin Username</Label>
            <Input value={config.adminUsername} onChange={(e) => setConfig({...config, adminUsername: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Admin Password</Label>
            <Input type="password" value={config.adminPassword} onChange={(e) => setConfig({...config, adminPassword: e.target.value})} />
          </div>
        </div>
        <Button onClick={() => handleSave('admin_credentials', { adminUsername: config.adminUsername, adminPassword: config.adminPassword })} disabled={saving}>Save Admin Credentials</Button>
      </div>
    </div>
  );
}
