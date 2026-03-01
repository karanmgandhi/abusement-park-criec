import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestionsForPhase } from "@/lib/question-generator";

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

  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId: session.user.id, groupId },
    },
  });
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const matches = await prisma.match.findMany({
    where: { groupId },
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { team1, team2, team1Short, team2Short, team1Flag, team2Flag, venue, startTime, groupId } = body;

  if (!team1 || !team2 || !groupId || !startTime) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });
  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const match = await prisma.match.create({
    data: {
      team1,
      team2,
      team1Short: team1Short || team1.slice(0, 3).toUpperCase(),
      team2Short: team2Short || team2.slice(0, 3).toUpperCase(),
      team1Flag: team1Flag || "",
      team2Flag: team2Flag || "",
      venue: venue || null,
      startTime: new Date(startTime),
      groupId,
    },
  });

  const preMatchQuestions = generateQuestionsForPhase(team1, team2, "pre_match", 4);
  for (const q of preMatchQuestions) {
    await prisma.question.create({
      data: {
        matchId: match.id,
        text: q.text,
        type: q.type,
        options: JSON.stringify(q.options),
        weight: q.weight,
        phase: q.phase,
      },
    });
  }

  return NextResponse.json(match);
}
