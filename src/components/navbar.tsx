"use client";

import { useSession, signOut } from "next-auth/react";
import { useUser, useGroups } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, LogOut, Coins, Users, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();
  const { user } = useUser();
  const { groups } = useGroups();
  const { activeGroupId, setActiveGroup } = useAppStore();

  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-2 pt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="hidden text-xl font-bold tracking-tight sm:inline">
              T20 PredictR
            </span>
          </Link>

          {groups.length > 0 && (
            <Select
              value={activeGroupId || ""}
              onValueChange={(v) => setActiveGroup(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g: { id: string; name: string }) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-3 py-1.5 text-sm font-semibold text-amber-500">
            <Coins className="h-4 w-4" />
            {user?.balance?.toLocaleString() ?? "..."}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="hidden sm:inline">
                  {session.user?.name ?? "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/history">My Bets</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/leaderboard">
          <Trophy className="mr-1 h-4 w-4" />
          Leaderboard
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/history">My Bets</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/group">
          <Users className="mr-1 h-4 w-4" />
          Groups
        </Link>
      </Button>
    </>
  );
}
