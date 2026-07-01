"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    enableEmails: false,
    resendApiKey: "",
    fromEmail: "noreply@example.com"
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings?key=email_config");
        const data = await res.json();
        if (data.value) {
          setConfig({
            enableEmails: data.value.enableEmails || false,
            resendApiKey: data.value.resendApiKey || "",
            fromEmail: data.value.fromEmail || "noreply@example.com"
          });
        }
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: 'email_config', value: config })
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
        <h3 className="text-lg font-medium">Email Configuration</h3>
        <p className="text-sm text-muted-foreground">Manage email sending via Resend.</p>
      </div>
      
      <div className="p-6 border rounded-lg bg-card space-y-6">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="enable" 
            className="w-4 h-4 rounded border-gray-300" 
            checked={config.enableEmails}
            onChange={(e) => setConfig({...config, enableEmails: e.target.checked})}
          />
          <Label htmlFor="enable">Enable Outgoing Emails</Label>
        </div>

        <div className="space-y-2">
          <Label>Sender Address (From)</Label>
          <Input 
            value={config.fromEmail} 
            onChange={(e) => setConfig({...config, fromEmail: e.target.value})} 
            placeholder="noreply@deine-domain.de" 
          />
        </div>

        <div className="space-y-2">
          <Label>Resend API Key</Label>
          <Input 
            type="password" 
            value={config.resendApiKey} 
            onChange={(e) => setConfig({...config, resendApiKey: e.target.value})} 
            placeholder="re_123456789" 
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>Save Email Settings</Button>
      </div>
    </div>
  );
}
