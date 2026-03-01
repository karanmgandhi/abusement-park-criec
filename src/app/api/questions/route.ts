import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId, text, type, options, weight } = await req.json();

  if (!matchId || !text || !type || !options || !weight) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (weight < 250 || weight > 1000) {
    return NextResponse.json(
      { error: "Weight must be 250-1000" },
      { status: 400 }
    );
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const question = await prisma.question.create({
    data: {
      matchId,
      text,
      type,
      options: JSON.stringify(options),
      weight,
      phase: match.currentPhase,
      isCustom: true,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(question);
}
