"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AuthSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    googleId: "", googleSecret: "",
    facebookId: "", facebookSecret: "",
    azureId: "", azureSecret: "", azureTenant: "",
    steamSecret: ""
  });

  useEffect(() => {
    async function load() {
      try {
        const [g, f, a, s] = await Promise.all([
          fetch("/api/settings?key=auth_google").then(r => r.json()),
          fetch("/api/settings?key=auth_facebook").then(r => r.json()),
          fetch("/api/settings?key=auth_azure").then(r => r.json()),
          fetch("/api/settings?key=auth_steam").then(r => r.json())
        ]);
        setConfig({
          googleId: g.value?.clientId || "",
          googleSecret: g.value?.clientSecret || "",
          facebookId: f.value?.clientId || "",
          facebookSecret: f.value?.clientSecret || "",
          azureId: a.value?.clientId || "",
          azureSecret: a.value?.clientSecret || "",
          azureTenant: a.value?.tenantId || "",
          steamSecret: s.value?.clientSecret || ""
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
        <h3 className="text-lg font-medium">Authentication Providers</h3>
        <p className="text-sm text-muted-foreground">Configure social logins.</p>
      </div>
      
      {/* Google */}
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Google</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input value={config.googleId} onChange={(e) => setConfig({...config, googleId: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Client Secret</Label>
            <Input type="password" value={config.googleSecret} onChange={(e) => setConfig({...config, googleSecret: e.target.value})} />
          </div>
        </div>
        <Button onClick={() => handleSave('auth_google', { clientId: config.googleId, clientSecret: config.googleSecret })} disabled={saving}>Save Google Config</Button>
      </div>

      {/* Facebook */}
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Facebook</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input value={config.facebookId} onChange={(e) => setConfig({...config, facebookId: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Client Secret</Label>
            <Input type="password" value={config.facebookSecret} onChange={(e) => setConfig({...config, facebookSecret: e.target.value})} />
          </div>
        </div>
        <Button onClick={() => handleSave('auth_facebook', { clientId: config.facebookId, clientSecret: config.facebookSecret })} disabled={saving}>Save Facebook Config</Button>
      </div>
      
      {/* Azure */}
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Azure AD</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input value={config.azureId} onChange={(e) => setConfig({...config, azureId: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Tenant ID</Label>
            <Input value={config.azureTenant} onChange={(e) => setConfig({...config, azureTenant: e.target.value})} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Client Secret</Label>
            <Input type="password" value={config.azureSecret} onChange={(e) => setConfig({...config, azureSecret: e.target.value})} />
          </div>
        </div>
        <Button onClick={() => handleSave('auth_azure', { clientId: config.azureId, clientSecret: config.azureSecret, tenantId: config.azureTenant })} disabled={saving}>Save Azure Config</Button>
      </div>

      {/* Steam */}
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Steam</h4>
        <div className="space-y-2">
          <Label>Steam Secret Key</Label>
          <Input type="password" value={config.steamSecret} onChange={(e) => setConfig({...config, steamSecret: e.target.value})} />
        </div>
        <Button onClick={() => handleSave('auth_steam', { clientSecret: config.steamSecret })} disabled={saving}>Save Steam Config</Button>
      </div>
    </div>
  );
}
