import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          balance: true,
          bets: {
            select: { amount: true, payout: true, status: true },
          },
        },
      },
    },
  });

  const leaderboard = members
    .map((m) => {
      const totalBets = m.user.bets.length;
      const wins = m.user.bets.filter((b) => b.status === "won").length;
      const losses = m.user.bets.filter((b) => b.status === "lost").length;
      const totalWagered = m.user.bets.reduce((s, b) => s + b.amount, 0);
      const totalWon = m.user.bets
        .filter((b) => b.status === "won")
        .reduce((s, b) => s + b.payout, 0);

      return {
        userId: m.user.id,
        name: m.user.name,
        image: m.user.image,
        balance: m.user.balance,
        totalBets,
        wins,
        losses,
        totalWagered,
        totalWon,
        profit: totalWon - totalWagered,
        winRate: totalBets > 0 ? Math.round((wins / totalBets) * 100) : 0,
        role: m.role,
      };
    })
    .sort((a, b) => b.balance - a.balance);

  return NextResponse.json(leaderboard);
}
