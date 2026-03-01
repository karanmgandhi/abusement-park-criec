import { prisma } from "@/lib/prisma";

export async function resolveQuestion(
  questionId: string,
  correctAnswer: string
) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { bets: true },
  });

  if (!question || question.status === "resolved") return null;

  const allBets = question.bets.filter((b) => b.status === "pending");
  if (allBets.length === 0) {
    await prisma.question.update({
      where: { id: questionId },
      data: { status: "resolved", correctAnswer, resolvedAt: new Date() },
    });
    return { winners: 0, losers: 0 };
  }

  const totalPot = allBets.reduce((sum, b) => sum + b.amount, 0);
  const winners = allBets.filter((b) => b.answer === correctAnswer);
  const losers = allBets.filter((b) => b.answer !== correctAnswer);
  const winnerPool = winners.reduce((sum, b) => sum + b.amount, 0);

  const updates = [];

  for (const bet of winners) {
    const proportion = bet.amount / winnerPool;
    const payout = Math.round(totalPot * proportion);

    updates.push(
      prisma.bet.update({
        where: { id: bet.id },
        data: { status: "won", payout },
      })
    );

    updates.push(
      prisma.user.update({
        where: { id: bet.userId },
        data: { balance: { increment: payout } },
      })
    );
  }

  for (const bet of losers) {
    updates.push(
      prisma.bet.update({
        where: { id: bet.id },
        data: { status: "lost", payout: 0 },
      })
    );
  }

  updates.push(
    prisma.question.update({
      where: { id: questionId },
      data: {
        status: "resolved",
        correctAnswer,
        resolvedAt: new Date(),
      },
    })
  );

  await prisma.$transaction(updates);

  return { winners: winners.length, losers: losers.length, totalPot };
}

export async function refundQuestion(questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { bets: true },
  });

  if (!question) return null;

  const updates = [];

  for (const bet of question.bets) {
    if (bet.status === "pending") {
      updates.push(
        prisma.bet.update({
          where: { id: bet.id },
          data: { status: "refunded", payout: bet.amount },
        })
      );
      updates.push(
        prisma.user.update({
          where: { id: bet.userId },
          data: { balance: { increment: bet.amount } },
        })
      );
    }
  }

  updates.push(
    prisma.question.update({
      where: { id: questionId },
      data: { status: "cancelled" },
    })
  );

  await prisma.$transaction(updates);
  return { refunded: question.bets.length };
}
