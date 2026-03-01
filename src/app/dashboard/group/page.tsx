"use client";

import { useState } from "react";
import { useGroups } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Users, Copy, LogIn, Crown, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  code: string;
  _count: { members: number };
  members: Array<{ role: string }>;
}

export default function GroupPage() {
  const { groups, mutate } = useGroups();
  const { setActiveGroup } = useAppStore();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Groups</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CreateGroupForm onCreated={mutate} />
          <JoinGroupForm onJoined={mutate} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Groups</h2>
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No groups yet. Create one or join with an invite code!
              </CardContent>
            </Card>
          ) : (
            groups.map((group: Group) => (
              <Card key={group.id} className="transition-all hover:border-primary/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    <Users className="h-6 w-6 text-emerald-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{group.name}</span>
                      {group.members[0]?.role === "admin" && (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          <Crown className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{group._count.members} members</span>
                      <span>·</span>
                      <span className="font-mono">{group.code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/join/${group.code}`
                          );
                          toast.success("Invite link copied!");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveGroup(group.id);
                      router.push("/dashboard");
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CreateGroupForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password: password || undefined }),
      });

      if (res.ok) {
        const group = await res.json();
        toast.success(
          `Group "${name}" created! Invite code: ${group.code}`
        );
        setName("");
        setPassword("");
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-emerald-500" />
          Create Group
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="World Cup Legends"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label>Password (optional)</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="For extra privacy"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function JoinGroupForm({ onJoined }: { onJoined: () => void }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${code.toUpperCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Joined group!");
        setCode("");
        setPassword("");
        onJoined();
      } else {
        toast.error(data.error || "Failed to join");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-cyan-500" />
          Join Group
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <Label>Invite Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              required
              maxLength={6}
              className="mt-1 font-mono text-lg tracking-widest"
            />
          </div>
          <div>
            <Label>Password (if required)</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Group password"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading} variant="outline" className="w-full gap-2">
            <Share2 className="h-4 w-4" />
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
