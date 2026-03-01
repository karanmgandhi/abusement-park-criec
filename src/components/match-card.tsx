"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Zap, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Short: string;
  team2Short: string;
  team1Score: string | null;
  team2Score: string | null;
  status: string;
  currentPhase: string;
  venue: string | null;
  startTime: string;
  result: string | null;
  _count: { questions: number };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-blue-500/10 text-blue-400" },
  live: { label: "LIVE", className: "bg-red-500/10 text-red-400 animate-pulse" },
  completed: { label: "Completed", className: "bg-slate-500/10 text-slate-400" },
  abandoned: { label: "Abandoned", className: "bg-amber-500/10 text-amber-400" },
};

export function MatchCard({ match }: { match: Match }) {
  const statusConfig = STATUS_CONFIG[match.status] || STATUS_CONFIG.upcoming;

  return (
    <Card className="group transition-all hover:border-primary/30 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge className={statusConfig.className}>
            {match.status === "live" && <Zap className="mr-1 h-3 w-3" />}
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {match._count.questions} questions
          </span>
        </div>

        <div className="mb-3 flex items-center justify-between text-center">
          <div className="flex-1">
            <div className="text-lg font-bold">{match.team1Short || match.team1}</div>
            {match.team1Score && (
              <div className="text-sm font-semibold text-emerald-400">
                {match.team1Score}
              </div>
            )}
          </div>
          <div className="px-4 text-lg font-bold text-muted-foreground">vs</div>
          <div className="flex-1">
            <div className="text-lg font-bold">{match.team2Short || match.team2}</div>
            {match.team2Score && (
              <div className="text-sm font-semibold text-cyan-400">
                {match.team2Score}
              </div>
            )}
          </div>
        </div>

        {match.result && (
          <div className="mb-2 text-center text-xs font-medium text-amber-400">
            {match.result}
          </div>
        )}

        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(match.startTime), "MMM d, h:mm a")}
          </span>
          {match.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {match.venue}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 group-hover:border-primary/50"
          asChild
        >
          <Link href={`/dashboard/match/${match.id}`}>
            {match.status === "live" ? "Predict Now" : "View Match"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
