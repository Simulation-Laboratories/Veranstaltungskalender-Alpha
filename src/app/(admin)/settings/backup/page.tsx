"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

export default function BackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/settings/backup");
      if (!res.ok) throw new Error("Failed to download backup");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.tar.gz`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully!");
    } catch (e) {
      toast.error("Error downloading backup");
    }
    setDownloading(false);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("WARNING: This will completely wipe the existing database and replace it with the uploaded backup. This action cannot be undone. Are you absolutely sure?")) {
      e.target.value = "";
      return;
    }

    setRestoring(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/settings/backup", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Restore failed");
      toast.success("Restore completed successfully! Reloading page...");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error("Error restoring backup");
    }
    setRestoring(false);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Backup & Restore</h3>
        <p className="text-sm text-muted-foreground">Manage your database backups and uploaded images.</p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Create Backup</h4>
        <p className="text-sm text-muted-foreground">
          Generate a full database dump (including all settings, users, and events) alongside your uploaded images as a UNENCRYPTED compressed .tar.gz archive.
        </p>
        <Button onClick={handleDownload} disabled={downloading || restoring}>
          <Download className="w-4 h-4 mr-2" />
          {downloading ? "Generating..." : "Download Backup"}
        </Button>
      </div>

      <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5 space-y-4">
        <h4 className="font-semibold text-destructive">Restore Backup</h4>
        <p className="text-sm text-muted-foreground">
          Upload a previous .tar.gz backup file to restore your database to an older state. This will permanently wipe all current data.
        </p>
        <div className="relative">
          <input
            type="file"
            accept=".tar.gz"
            onChange={handleRestore}
            disabled={downloading || restoring}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button variant="destructive" disabled={downloading || restoring}>
            <Upload className="w-4 h-4 mr-2" />
            {restoring ? "Restoring Data..." : "Upload Backup File"}
          </Button>
        </div>
      </div>
    </div>
  );
}
