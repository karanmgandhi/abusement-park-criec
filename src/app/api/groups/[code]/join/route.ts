import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const { password } = await req.json();

  const group = await prisma.group.findUnique({ where: { code } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.password && group.password !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 403 });
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: group.id } },
  });

  if (existingMember) {
    return NextResponse.json({ message: "Already a member", group });
  }

  await prisma.groupMember.create({
    data: { userId: session.user.id, groupId: group.id },
  });

  return NextResponse.json({ message: "Joined successfully", group });
}
