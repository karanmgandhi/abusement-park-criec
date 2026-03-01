"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Short: string;
  team2Short: string;
  team1Flag: string;
  team2Flag: string;
  team1Score: string | null;
  team2Score: string | null;
  status: string;
  currentPhase: string;
  venue: string | null;
  result: string | null;
}

const FLAG_MAP: Record<string, string> = {
  India: "🇮🇳",
  Australia: "🇦🇺",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "South Africa": "🇿🇦",
  "New Zealand": "🇳🇿",
  Pakistan: "🇵🇰",
  "Sri Lanka": "🇱🇰",
  Bangladesh: "🇧🇩",
  "West Indies": "🏝️",
  Afghanistan: "🇦🇫",
  Ireland: "🇮🇪",
  Zimbabwe: "🇿🇼",
  Netherlands: "🇳🇱",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA: "🇺🇸",
  Nepal: "🇳🇵",
  Oman: "🇴🇲",
  Uganda: "🇺🇬",
  Namibia: "🇳🇦",
  "Papua New Guinea": "🇵🇬",
};

function getFlag(team: string, flag: string): string {
  if (flag) return flag;
  return FLAG_MAP[team] || "🏏";
}

const PHASE_LABELS: Record<string, string> = {
  pre_match: "Pre-Match",
  powerplay: "Powerplay",
  middle: "Middle Overs",
  death: "Death Overs",
  innings_break: "Innings Break",
  second_innings: "2nd Innings",
  completed: "Completed",
  post_match: "Post-Match",
};

export function LiveScoreCard({ match }: { match: Match }) {
  const isLive = match.status === "live";

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {isLive && (
        <div className="absolute right-4 top-4">
          <Badge className="animate-pulse bg-red-500 text-white">
            <Zap className="mr-1 h-3 w-3" /> LIVE
          </Badge>
        </div>
      )}

      {match.status === "upcoming" && (
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
            Upcoming
          </Badge>
        </div>
      )}

      {match.status === "completed" && (
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="border-slate-500 text-slate-400">
            Completed
          </Badge>
        </div>
      )}

      <div className="mb-2 text-xs text-slate-400">
        {match.venue && <span>{match.venue} &middot; </span>}
        <span>{PHASE_LABELS[match.currentPhase] || match.currentPhase}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">{getFlag(match.team1, match.team1Flag)}</span>
          <span className="text-sm font-semibold">{match.team1Short || match.team1}</span>
          {match.team1Score && (
            <span className="text-lg font-bold text-emerald-400">
              {match.team1Score}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-slate-500">vs</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">{getFlag(match.team2, match.team2Flag)}</span>
          <span className="text-sm font-semibold">{match.team2Short || match.team2}</span>
          {match.team2Score && (
            <span className="text-lg font-bold text-cyan-400">
              {match.team2Score}
            </span>
          )}
        </div>
      </div>

      {match.result && (
        <div className="mt-3 text-center text-sm font-medium text-amber-400">
          {match.result}
        </div>
      )}
    </Card>
  );
}

export function LiveScoreTicker({ matches }: { matches: Match[] }) {
  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const displayMatches = [...liveMatches, ...upcomingMatches].slice(0, 5);

  if (displayMatches.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {displayMatches.map((match) => (
        <div
          key={match.id}
          className="flex min-w-[200px] items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-2"
        >
          <span className="text-lg">{getFlag(match.team1, match.team1Flag)}</span>
          <div className="flex flex-col text-xs">
            <span className="font-medium">{match.team1Short} vs {match.team2Short}</span>
            {match.team1Score && (
              <span className="text-muted-foreground">{match.team1Score}</span>
            )}
          </div>
          <span className="text-lg">{getFlag(match.team2, match.team2Flag)}</span>
          {match.status === "live" && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          )}
        </div>
      ))}
    </div>
  );
}
