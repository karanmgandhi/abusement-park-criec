"use client";

import { useBets, useUser } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CheckCircle2, XCircle, Clock, RotateCcw, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Bet {
  id: string;
  answer: string;
  amount: number;
  payout: number;
  status: string;
  createdAt: string;
  question: {
    text: string;
    status: string;
    correctAnswer: string | null;
    weight: number;
    match: { team1: string; team2: string };
  };
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "text-amber-400", label: "Pending" },
  won: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-400", label: "Won" },
  lost: { icon: <XCircle className="h-4 w-4" />, color: "text-red-400", label: "Lost" },
  refunded: { icon: <RotateCcw className="h-4 w-4" />, color: "text-blue-400", label: "Refunded" },
};

export default function HistoryPage() {
  const { bets, isLoading } = useBets();
  const { user } = useUser();

  const totalWagered = bets.reduce((s: number, b: Bet) => s + b.amount, 0);
  const totalWon = bets
    .filter((b: Bet) => b.status === "won")
    .reduce((s: number, b: Bet) => s + b.payout, 0);
  const wins = bets.filter((b: Bet) => b.status === "won").length;
  const losses = bets.filter((b: Bet) => b.status === "lost").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bets</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Balance"
          value={`${(user?.balance ?? 0).toLocaleString()}`}
          icon={<Coins className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          label="Total Wagered"
          value={totalWagered.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5 text-cyan-500" />}
        />
        <StatCard
          label="Total Won"
          value={totalWon.toLocaleString()}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          label="Win Rate"
          value={
            wins + losses > 0
              ? `${Math.round((wins / (wins + losses)) * 100)}%`
              : "N/A"
          }
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : bets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bets yet. Head to a match and start predicting! 🏏
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bets.map((bet: Bet) => {
            const config = STATUS_CONFIG[bet.status] || STATUS_CONFIG.pending;
            return (
              <Card key={bet.id} className="transition-all hover:border-primary/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={config.color}>{config.icon}</div>

                  <div className="flex-1">
                    <div className="font-medium">{bet.question.text}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {bet.question.match.team1} vs {bet.question.match.team2}
                      {" · "}
                      {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">
                      Picked: <span className="font-semibold">{bet.answer}</span>
                    </div>
                    <div className="text-sm">
                      Bet: <span className="font-semibold text-amber-400">{bet.amount} pts</span>
                    </div>
                    {bet.payout > 0 && (
                      <div className="text-sm font-bold text-emerald-400">
                        Won: +{bet.payout} pts
                      </div>
                    )}
                  </div>

                  <Badge className={`${config.color} bg-transparent`}>
                    {config.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
