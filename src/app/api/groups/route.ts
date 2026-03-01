import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { members: true } },
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });

  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, password } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Group name required" }, { status: 400 });
  }

  let code = generateCode();
  let existing = await prisma.group.findUnique({ where: { code } });
  while (existing) {
    code = generateCode();
    existing = await prisma.group.findUnique({ where: { code } });
  }

  const group = await prisma.group.create({
    data: {
      name,
      code,
      password: password || null,
      members: {
        create: { userId: session.user.id, role: "admin" },
      },
    },
  });

  return NextResponse.json(group);
}
