import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveQuestion, refundQuestion } from "@/lib/bet-resolver";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { correctAnswer, action } = await req.json();

  const question = await prisma.question.findUnique({
    where: { id },
    include: { match: { include: { group: { include: { members: true } } } } },
  });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = question.match.group.members.some(
    (m) => m.userId === session.user.id && m.role === "admin"
  );
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  if (action === "refund") {
    const result = await refundQuestion(id);
    return NextResponse.json(result);
  }

  if (!correctAnswer) {
    return NextResponse.json(
      { error: "correctAnswer required" },
      { status: 400 }
    );
  }

  const result = await resolveQuestion(id, correctAnswer);
  return NextResponse.json(result);
}
