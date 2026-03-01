import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (matchId) {
    where.question = { matchId };
  }

  const bets = await prisma.bet.findMany({
    where,
    include: {
      question: {
        select: {
          text: true,
          status: true,
          correctAnswer: true,
          weight: true,
          match: { select: { team1: true, team2: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, answer, amount } = await req.json();

  if (!questionId || !answer || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (amount < 250 || amount > 1000) {
    return NextResponse.json(
      { error: "Bet must be 250-1000 points" },
      { status: 400 }
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question || question.status !== "open") {
    return NextResponse.json(
      { error: "Question not available for betting" },
      { status: 400 }
    );
  }

  const options: string[] = JSON.parse(question.options);
  if (!options.includes(answer)) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  const existingBet = await prisma.bet.findUnique({
    where: {
      userId_questionId: { userId: session.user.id, questionId },
    },
  });

  if (existingBet) {
    return NextResponse.json(
      { error: "Already placed a bet on this question" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.balance < amount) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  const [bet] = await prisma.$transaction([
    prisma.bet.create({
      data: {
        userId: session.user.id,
        questionId,
        answer,
        amount,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { decrement: amount } },
    }),
    prisma.question.update({
      where: { id: questionId },
      data: { totalPot: { increment: amount } },
    }),
  ]);

  return NextResponse.json(bet);
}
