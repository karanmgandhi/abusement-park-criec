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

  const messages = await prisma.chatMessage.findMany({
    where: { groupId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(messages.reverse());
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId, content } = await req.json();

  if (!groupId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId: session.user.id, groupId },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: content.slice(0, 500),
      userId: session.user.id,
      groupId,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(message);
}
