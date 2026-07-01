"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function ClaimButton({ locationId }: { locationId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/locations/${locationId}/claim`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Fehler beim Senden");
      toast.success("Anfrage gesendet! Ein Admin wird sich in Kürze bei dir melden.");
    } catch {
      toast.error("Fehler beim Senden der Anfrage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClaim}
      disabled={loading}
    >
      {loading ? "Wird gesendet..." : "Gehört dir diese Location? (Verifizieren)"}
    </Button>
  );
}
