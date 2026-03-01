"use client";

import { useEffect } from "react";
import { useMatches, useGroups } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { MatchCard } from "@/components/match-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Chat } from "@/components/chat";
import { LiveScoreTicker } from "@/components/live-score";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Share2, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AddMatchDialog } from "@/components/add-match";

export default function DashboardPage() {
  const { groups } = useGroups();
  const { activeGroupId, setActiveGroup } = useAppStore();
  const { matches } = useMatches(activeGroupId);

  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroup(groups[0].id);
    }
  }, [groups, activeGroupId, setActiveGroup]);

  const activeGroup = groups.find(
    (g: { id: string }) => g.id === activeGroupId
  );

  if (groups.length === 0) {
    return <EmptyState />;
  }

  const liveMatches = matches.filter(
    (m: { status: string }) => m.status === "live"
  );
  const upcomingMatches = matches.filter(
    (m: { status: string }) => m.status === "upcoming"
  );
  const completedMatches = matches.filter(
    (m: { status: string }) => m.status === "completed"
  );

  return (
    <div className="space-y-6">
      <LiveScoreTicker matches={matches} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {activeGroup?.name || "Dashboard"}
          </h1>
          {activeGroup && (
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Invite code:{" "}
                <span className="font-mono font-bold text-primary">
                  {activeGroup.code}
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${activeGroup.code}`
                  );
                  toast.success("Invite link copied!");
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {activeGroupId && <AddMatchDialog groupId={activeGroupId} />}
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/group">
              <Users className="mr-1 h-4 w-4" />
              Groups
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {liveMatches.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Live Matches
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {liveMatches.map(
                  (m: { id: string } & Record<string, unknown>) => (
                    <MatchCard key={m.id} match={m as never} />
                  )
                )}
              </div>
            </section>
          )}

          {upcomingMatches.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Upcoming Matches</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingMatches.map(
                  (m: { id: string } & Record<string, unknown>) => (
                    <MatchCard key={m.id} match={m as never} />
                  )
                )}
              </div>
            </section>
          )}

          {completedMatches.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">
                Completed Matches
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {completedMatches.map(
                  (m: { id: string } & Record<string, unknown>) => (
                    <MatchCard key={m.id} match={m as never} />
                  )
                )}
              </div>
            </section>
          )}

          {matches.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <div className="text-4xl">🏏</div>
                <p className="text-muted-foreground">
                  No matches yet. Add a match to start predicting!
                </p>
                {activeGroupId && <AddMatchDialog groupId={activeGroupId} />}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <LeaderboardTable groupId={activeGroupId} compact />
          <Chat groupId={activeGroupId} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="text-6xl">🏏</div>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome to T20 PredictR!</h2>
        <p className="mt-2 text-muted-foreground">
          Create a group or join one to start predicting
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500">
          <Link href="/dashboard/group">
            <Plus className="h-4 w-4" />
            Create Group
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/dashboard/group">
            <Share2 className="h-4 w-4" />
            Join Group
          </Link>
        </Button>
      </div>
    </div>
  );
}
