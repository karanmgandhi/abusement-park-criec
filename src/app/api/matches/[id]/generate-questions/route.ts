import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestionsForPhase } from "@/lib/question-generator";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { phase } = await req.json();

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

  const targetPhase = phase || match.currentPhase;
  const questions = generateQuestionsForPhase(match.team1, match.team2, targetPhase, 4);

  const created = [];
  for (const q of questions) {
    const question = await prisma.question.create({
      data: {
        matchId: match.id,
        text: q.text,
        type: q.type,
        options: JSON.stringify(q.options),
        weight: q.weight,
        phase: q.phase,
      },
    });
    created.push(question);
  }

  await prisma.match.update({
    where: { id },
    data: { currentPhase: targetPhase },
  });

  return NextResponse.json(created);
}
