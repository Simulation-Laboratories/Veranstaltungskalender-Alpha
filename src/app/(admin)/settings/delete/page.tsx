"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function DeleteDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-destructive">Delete Data</h3>
        <p className="text-sm text-muted-foreground">Permanently remove data from your system.</p>
      </div>
      
      <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5 space-y-6">
        <div className="space-y-2">
          <h4 className="font-semibold text-destructive">Danger Zone</h4>
          <p className="text-sm text-muted-foreground">
            Select the types of data you want to delete. This action cannot be undone.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="events" className="w-4 h-4 rounded border-gray-300" />
            <Label htmlFor="events">Delete all Events</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="locations" className="w-4 h-4 rounded border-gray-300" />
            <Label htmlFor="locations">Delete all Locations</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="organizers" className="w-4 h-4 rounded border-gray-300" />
            <Label htmlFor="organizers">Delete all Organizers</Label>
          </div>
        </div>

        <Button variant="destructive" disabled>Delete Selected Data (Coming Soon)</Button>
      </div>
    </div>
  );
}
