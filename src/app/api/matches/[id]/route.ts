import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          _count: { select: { bets: true } },
          bets: {
            where: { userId: session.user.id },
            select: { answer: true, amount: true, status: true, payout: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const match = await prisma.match.findUnique({
    where: { id },
    include: { group: { include: { members: true } } },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const isAdmin = match.group.members.some(
    (m) => m.userId === session.user.id && m.role === "admin"
  );
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const updated = await prisma.match.update({
    where: { id },
    data: {
      status: body.status,
      team1Score: body.team1Score,
      team2Score: body.team2Score,
      currentPhase: body.currentPhase,
      liveData: body.liveData ? JSON.stringify(body.liveData) : undefined,
      result: body.result,
    },
  });

  return NextResponse.json(updated);
}
