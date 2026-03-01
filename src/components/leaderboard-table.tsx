"use client";

import { useLeaderboard } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Crown, Medal } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  balance: number;
  totalBets: number;
  wins: number;
  losses: number;
  totalWagered: number;
  totalWon: number;
  profit: number;
  winRate: number;
  role: string;
}

const RANK_ICONS = [
  <Crown key="1" className="h-5 w-5 text-amber-400" />,
  <Medal key="2" className="h-5 w-5 text-slate-300" />,
  <Medal key="3" className="h-5 w-5 text-amber-600" />,
];

export function LeaderboardTable({
  groupId,
  compact = false,
}: {
  groupId: string | null;
  compact?: boolean;
}) {
  const { leaderboard, isLoading } = useLeaderboard(groupId);

  if (!groupId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select a group to see the leaderboard
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  const displayed = compact ? leaderboard.slice(0, 5) : leaderboard;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {displayed.map((entry: LeaderboardEntry, idx: number) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-6 py-2.5 transition-colors hover:bg-muted/50 ${
                idx === 0 ? "bg-amber-500/5" : ""
              }`}
            >
              <div className="flex w-8 items-center justify-center">
                {idx < 3 ? (
                  RANK_ICONS[idx]
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {idx + 1}
                  </span>
                )}
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold">
                {entry.name[0]?.toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.name}</span>
                  {entry.role === "admin" && (
                    <Badge variant="outline" className="h-5 text-[10px]">
                      Admin
                    </Badge>
                  )}
                </div>
                {!compact && (
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{entry.totalBets} bets</span>
                    <span>{entry.winRate}% win rate</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="font-bold">{entry.balance.toLocaleString()}</div>
                <div
                  className={`flex items-center justify-end gap-0.5 text-xs ${
                    entry.profit >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {entry.profit >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {entry.profit >= 0 ? "+" : ""}
                  {entry.profit.toLocaleString()}
                </div>
              </div>
            </div>
          ))}

          {displayed.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No members yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
