"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks";
import { Coins, CheckCircle2, XCircle, Clock, Lock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string;
  weight: number;
  phase: string;
  status: string;
  correctAnswer: string | null;
  totalPot: number;
  isCustom: boolean;
  _count: { bets: number };
  bets: Array<{
    answer: string;
    amount: number;
    status: string;
    payout: number;
  }>;
}

const PHASE_COLORS: Record<string, string> = {
  pre_match: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  powerplay: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  middle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  death: "bg-red-500/10 text-red-400 border-red-500/20",
  post_match: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const WEIGHT_LABELS: Record<number, string> = {
  250: "Easy",
  500: "Medium",
  750: "Hard",
  1000: "Expert",
};

export function QuestionCard({
  question,
  onBetPlaced,
  isAdmin,
  onResolve,
}: {
  question: Question;
  onBetPlaced?: () => void;
  isAdmin?: boolean;
  onResolve?: (questionId: string, answer: string) => void;
}) {
  const [betOpen, setBetOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(question.weight);
  const [isPlacing, setIsPlacing] = useState(false);
  const { user, mutate: mutateUser } = useUser();

  const options: string[] = JSON.parse(question.options);
  const myBet = question.bets[0];
  const isOpen = question.status === "open";
  const isResolved = question.status === "resolved";

  async function placeBet() {
    if (!selectedAnswer) return;
    setIsPlacing(true);

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: selectedAnswer,
          amount: betAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to place bet");
        return;
      }

      toast.success(`Bet placed! ${betAmount} pts on "${selectedAnswer}"`);
      setBetOpen(false);
      mutateUser();
      onBetPlaced?.();
    } catch {
      toast.error("Network error");
    } finally {
      setIsPlacing(false);
    }
  }

  if (myBet?.status === "won" && isResolved) {
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }, 100);
  }

  return (
    <>
      <Card
        className={`transition-all ${
          isOpen
            ? "border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            : "border-border/30 opacity-80"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-snug">
              {question.text}
            </CardTitle>
            <div className="flex shrink-0 gap-1.5">
              {question.isCustom && (
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Custom
                </Badge>
              )}
              <Badge className={PHASE_COLORS[question.phase] || ""}>
                {question.phase.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {WEIGHT_LABELS[question.weight] || question.weight} ({question.weight} pts)
            </span>
            <span>·</span>
            <span>Pot: {question.totalPot.toLocaleString()} pts</span>
            <span>·</span>
            <span>{question._count.bets} bets</span>
          </div>

          {myBet ? (
            <div
              className={`rounded-lg p-3 ${
                myBet.status === "won"
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : myBet.status === "lost"
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-muted/50 border border-border/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {myBet.status === "won" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {myBet.status === "lost" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {myBet.status === "pending" && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    Your bet: &ldquo;{myBet.answer}&rdquo; for {myBet.amount} pts
                  </span>
                </div>
                {myBet.payout > 0 && (
                  <span className="text-sm font-bold text-emerald-400">
                    +{myBet.payout} pts
                  </span>
                )}
              </div>
              {isResolved && question.correctAnswer && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Correct answer: {question.correctAnswer}
                </div>
              )}
            </div>
          ) : isOpen ? (
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAnswer(option);
                    setBetAmount(question.weight);
                    setBetOpen(true);
                  }}
                  className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              {isResolved
                ? `Resolved: ${question.correctAnswer}`
                : "Betting closed"}
            </div>
          )}

          {isAdmin && isOpen && (
            <div className="flex flex-wrap gap-1 border-t border-border/50 pt-2">
              <span className="mr-2 text-xs text-muted-foreground">Resolve:</span>
              {options.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onResolve?.(question.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={betOpen} onOpenChange={setBetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place Your Bet</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground">{question.text}</p>
              <p className="mt-2 text-lg font-semibold text-primary">
                Your pick: &ldquo;{selectedAnswer}&rdquo;
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bet amount</span>
                <span className="flex items-center gap-1 text-lg font-bold text-amber-500">
                  <Coins className="h-4 w-4" />
                  {betAmount}
                </span>
              </div>
              <Slider
                value={[betAmount]}
                onValueChange={([v]) => setBetAmount(v)}
                min={250}
                max={Math.min(1000, user?.balance ?? 0)}
                step={50}
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>250</span>
                <span>Balance: {user?.balance?.toLocaleString() ?? 0}</span>
                <span>{Math.min(1000, user?.balance ?? 0)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current pot</span>
                <span>{question.totalPot.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total bettors</span>
                <span>{question._count.bets}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={placeBet}
              disabled={isPlacing || !selectedAnswer || betAmount < 250}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
            >
              {isPlacing ? "Placing..." : `Bet ${betAmount} pts`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
