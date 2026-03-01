"use client";

import { useEffect } from "react";
import { useGroups } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { LeaderboardTable } from "@/components/leaderboard-table";

export default function LeaderboardPage() {
  const { groups } = useGroups();
  const { activeGroupId, setActiveGroup } = useAppStore();

  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroup(groups[0].id);
    }
  }, [groups, activeGroupId, setActiveGroup]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <LeaderboardTable groupId={activeGroupId} />
    </div>
  );
}
