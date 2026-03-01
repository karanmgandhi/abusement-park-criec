import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  const user1 = await prisma.user.upsert({
    where: { email: "rohit@predictr.app" },
    update: {},
    create: { name: "Rohit", email: "rohit@predictr.app", password, balance: 5000 },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "virat@predictr.app" },
    update: {},
    create: { name: "Virat", email: "virat@predictr.app", password, balance: 5000 },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "jasprit@predictr.app" },
    update: {},
    create: { name: "Jasprit", email: "jasprit@predictr.app", password, balance: 5000 },
  });

  const group = await prisma.group.upsert({
    where: { code: "WC2026" },
    update: {},
    create: { name: "World Cup Squad", code: "WC2026" },
  });

  for (const user of [user1, user2, user3]) {
    await prisma.groupMember.upsert({
      where: { userId_groupId: { userId: user.id, groupId: group.id } },
      update: {},
      create: {
        userId: user.id,
        groupId: group.id,
        role: user.id === user1.id ? "admin" : "member",
      },
    });
  }

  const match = await prisma.match.create({
    data: {
      team1: "India",
      team2: "West Indies",
      team1Short: "IND",
      team2Short: "WI",
      venue: "Kensington Oval, Barbados",
      startTime: new Date(Date.now() + 3600 * 1000),
      groupId: group.id,
      status: "upcoming",
      currentPhase: "pre_match",
    },
  });

  const questions = [
    { text: "Will India win the toss?", type: "yes_no", options: ["Yes", "No"], weight: 250, phase: "pre_match" },
    { text: "Who will win the match?", type: "multiple_choice", options: ["India", "West Indies"], weight: 750, phase: "pre_match" },
    { text: "Will the 1st innings total be over 170?", type: "yes_no", options: ["Yes", "No"], weight: 500, phase: "pre_match" },
    { text: "Total match sixes: Over or Under 12?", type: "multiple_choice", options: ["Over 12", "Under 12"], weight: 500, phase: "pre_match" },
  ];

  for (const q of questions) {
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

  const match2 = await prisma.match.create({
    data: {
      team1: "India",
      team2: "Australia",
      team1Short: "IND",
      team2Short: "AUS",
      venue: "Melbourne Cricket Ground",
      startTime: new Date(Date.now() + 86400 * 1000),
      groupId: group.id,
      status: "upcoming",
      currentPhase: "pre_match",
    },
  });

  await prisma.question.create({
    data: {
      matchId: match2.id,
      text: "Who will win the match?",
      type: "multiple_choice",
      options: JSON.stringify(["India", "Australia"]),
      weight: 750,
      phase: "pre_match",
    },
  });

  console.log("Seed complete!");
  console.log(`  Users: ${user1.email}, ${user2.email}, ${user3.email}`);
  console.log(`  Password: password123`);
  console.log(`  Group code: WC2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
