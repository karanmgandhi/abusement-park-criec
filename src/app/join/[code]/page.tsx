"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Trophy } from "lucide-react";
import Link from "next/link";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Joined group! Redirecting...");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to join");
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-emerald-500" />
          <span className="text-2xl font-bold">T20 PredictR</span>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">
              You&apos;re invited to a group!
            </h2>
            <p className="mb-4 text-muted-foreground">
              Code: <span className="font-mono font-bold">{code}</span>
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              Sign in or create an account to join
            </p>
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              <Link href="/">Sign In / Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-8 w-8 text-emerald-500" />
        <span className="text-2xl font-bold">T20 PredictR</span>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Join Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Invite code:{" "}
              <span className="font-mono text-lg font-bold text-primary">
                {code}
              </span>
            </p>
          </div>

          <div>
            <Label>Password (if required)</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter group password"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          >
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
