import { Button } from "@/components/ui/button";

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Backup & Restore</h3>
        <p className="text-sm text-muted-foreground">Manage your database backups.</p>
      </div>
      
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Create Backup</h4>
        <p className="text-sm text-muted-foreground">
          Generate a full database dump including all settings, users, and events.
        </p>
        <Button disabled>Create Backup (Coming Soon)</Button>
      </div>
      
      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h4 className="font-semibold">Restore Backup</h4>
        <p className="text-sm text-muted-foreground">
          Upload a previous backup file to restore your database to an older state.
        </p>
        <Button variant="outline" disabled>Restore Backup (Coming Soon)</Button>
      </div>
    </div>
  );
}
