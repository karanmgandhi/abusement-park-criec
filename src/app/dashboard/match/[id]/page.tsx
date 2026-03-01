"use client";

import { use, useState } from "react";
import { useMatch, useGroups } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { LiveScoreCard } from "@/components/live-score";
import { QuestionCard } from "@/components/question-card";
import { CreateQuestion } from "@/components/create-question";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const PHASES = [
  { value: "pre_match", label: "Pre-Match" },
  { value: "powerplay", label: "Powerplay (1-6 ov)" },
  { value: "middle", label: "Middle Overs (7-15)" },
  { value: "death", label: "Death Overs (16-20)" },
  { value: "innings_break", label: "Innings Break" },
  { value: "second_innings", label: "2nd Innings" },
  { value: "post_match", label: "Post-Match" },
  { value: "completed", label: "Completed" },
];

export default function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { match, mutate } = useMatch(id);
  const { groups } = useGroups();
  const { data: session } = useSession();
  const [generatingPhase, setGeneratingPhase] = useState("");

  if (!match) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAdmin = groups.some(
    (g: { id: string; members: Array<{ role: string }> }) =>
      g.id === match.groupId &&
      g.members?.[0]?.role === "admin"
  );

  const openQuestions = match.questions.filter(
    (q: { status: string }) => q.status === "open"
  );
  const resolvedQuestions = match.questions.filter(
    (q: { status: string }) => q.status === "resolved"
  );

  async function generateQuestions(phase: string) {
    setGeneratingPhase(phase);
    try {
      const res = await fetch(`/api/matches/${id}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase }),
      });
      if (res.ok) {
        toast.success(`Generated questions for ${phase.replace("_", " ")}`);
        mutate();
      }
    } finally {
      setGeneratingPhase("");
    }
  }

  async function updateMatchPhase(phase: string) {
    const statusMap: Record<string, string> = {
      pre_match: "upcoming",
      completed: "completed",
    };

    await fetch(`/api/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPhase: phase,
        status: statusMap[phase] || "live",
      }),
    });
    mutate();
    toast.success(`Phase updated to ${phase.replace("_", " ")}`);
  }

  async function resolveQuestion(questionId: string, answer: string) {
    const confirmed = window.confirm(
      `Resolve this question with answer: "${answer}"?`
    );
    if (!confirmed) return;

    const res = await fetch(`/api/questions/${questionId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctAnswer: answer }),
    });

    if (res.ok) {
      toast.success("Question resolved! Payouts distributed.");
      mutate();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {match.team1} vs {match.team2}
        </h1>
        <Badge variant="outline">{match.currentPhase.replace("_", " ")}</Badge>
      </div>

      <LiveScoreCard match={match} />

      {isAdmin && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-amber-400">
              Admin Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Match Phase:</span>
              {PHASES.map((p) => (
                <Button
                  key={p.value}
                  variant={match.currentPhase === p.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => updateMatchPhase(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Generate questions:
              </span>
              <Select
                value={generatingPhase}
                onValueChange={(v) => generateQuestions(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.filter((p) => !["completed", "innings_break", "second_innings"].includes(p.value)).map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Score update:
              </span>
              <ScoreEditor matchId={id} onUpdate={mutate} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Active Predictions ({openQuestions.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          <CreateQuestion matchId={id} onCreated={() => mutate()} />
        </div>
      </div>

      {openQuestions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {openQuestions.map((q: { id: string } & Record<string, unknown>) => (
            <QuestionCard
              key={q.id}
              question={q as never}
              onBetPlaced={() => mutate()}
              isAdmin={isAdmin}
              onResolve={resolveQuestion}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active questions. {isAdmin ? "Generate some or create custom ones!" : "Wait for the admin to add questions."}
          </CardContent>
        </Card>
      )}

      {resolvedQuestions.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">
            Resolved ({resolvedQuestions.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {resolvedQuestions.map(
              (q: { id: string } & Record<string, unknown>) => (
                <QuestionCard key={q.id} question={q as never} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ScoreEditor({
  matchId,
  onUpdate,
}: {
  matchId: string;
  onUpdate: () => void;
}) {
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [result, setResult] = useState("");

  async function update() {
    await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team1Score: score1 || undefined,
        team2Score: score2 || undefined,
        result: result || undefined,
      }),
    });
    onUpdate();
    toast.success("Score updated");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        placeholder="Team 1 score"
        value={score1}
        onChange={(e) => setScore1(e.target.value)}
        className="h-8 w-32 rounded border border-border bg-background px-2 text-xs"
      />
      <input
        placeholder="Team 2 score"
        value={score2}
        onChange={(e) => setScore2(e.target.value)}
        className="h-8 w-32 rounded border border-border bg-background px-2 text-xs"
      />
      <input
        placeholder="Result text"
        value={result}
        onChange={(e) => setResult(e.target.value)}
        className="h-8 w-48 rounded border border-border bg-background px-2 text-xs"
      />
      <Button size="sm" variant="outline" className="h-8" onClick={update}>
        Update
      </Button>
    </div>
  );
}
