"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useMatches } from "@/lib/hooks";

const PRESET_MATCHES = [
  { team1: "India", team2: "West Indies", team1Short: "IND", team2Short: "WI", venue: "Kensington Oval, Barbados" },
  { team1: "India", team2: "Australia", team1Short: "IND", team2Short: "AUS", venue: "Melbourne Cricket Ground" },
  { team1: "India", team2: "England", team1Short: "IND", team2Short: "ENG", venue: "Lord's, London" },
  { team1: "India", team2: "Pakistan", team1Short: "IND", team2Short: "PAK", venue: "Dubai International Stadium" },
  { team1: "India", team2: "South Africa", team1Short: "IND", team2Short: "SA", venue: "Newlands, Cape Town" },
  { team1: "Australia", team2: "England", team1Short: "AUS", team2Short: "ENG", venue: "The Gabba, Brisbane" },
  { team1: "India", team2: "New Zealand", team1Short: "IND", team2Short: "NZ", venue: "Eden Gardens, Kolkata" },
  { team1: "Pakistan", team2: "Bangladesh", team1Short: "PAK", team2Short: "BAN", venue: "Rawalpindi Cricket Stadium" },
];

export function AddMatchDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [team1Short, setTeam1Short] = useState("");
  const [team2Short, setTeam2Short] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { mutate } = useMatches(groupId);

  function fillPreset(p: (typeof PRESET_MATCHES)[0]) {
    setTeam1(p.team1);
    setTeam2(p.team2);
    setTeam1Short(p.team1Short);
    setTeam2Short(p.team2Short);
    setVenue(p.venue);
  }

  async function handleCreate() {
    if (!team1 || !team2 || !startTime) {
      toast.error("Fill in team names and start time");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1,
          team2,
          team1Short: team1Short || team1.slice(0, 3).toUpperCase(),
          team2Short: team2Short || team2.slice(0, 3).toUpperCase(),
          venue,
          startTime,
          groupId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create match");
        return;
      }

      toast.success("Match created with pre-match questions!");
      setOpen(false);
      setTeam1("");
      setTeam2("");
      setVenue("");
      setStartTime("");
      mutate();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500">
          <Plus className="h-4 w-4" />
          Add Match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Match</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">Quick picks</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MATCHES.map((p) => (
                <Button
                  key={`${p.team1}-${p.team2}`}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => fillPreset(p)}
                >
                  {p.team1Short} vs {p.team2Short}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Team 1</Label>
              <Input value={team1} onChange={(e) => setTeam1(e.target.value)} placeholder="India" className="mt-1" />
            </div>
            <div>
              <Label>Team 2</Label>
              <Input value={team2} onChange={(e) => setTeam2(e.target.value)} placeholder="West Indies" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Team 1 Short</Label>
              <Input value={team1Short} onChange={(e) => setTeam1Short(e.target.value)} placeholder="IND" className="mt-1" />
            </div>
            <div>
              <Label>Team 2 Short</Label>
              <Input value={team2Short} onChange={(e) => setTeam2Short(e.target.value)} placeholder="WI" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Venue</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Kensington Oval, Barbados" className="mt-1" />
          </div>

          <div>
            <Label>Start Time</Label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Match"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
