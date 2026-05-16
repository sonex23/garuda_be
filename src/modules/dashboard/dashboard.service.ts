import { prisma } from '../../lib/prisma.js';
import { TransactionType } from '@prisma/client';

export async function getDashboardSummary(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const sellTransactionsThisMonth = await prisma.transaction.findMany({
    where: {
      userId,
      type: TransactionType.SELL,
      createdAt: {
        gte: currentMonthStart,
        lt: currentMonthEnd
      }
    },
    select: {
      metadataJson: true
    }
  });

  const monthlyProfit = sellTransactionsThisMonth.reduce((sum, transaction) => {
    if (!transaction.metadataJson) {
      return sum;
    }

    try {
      const metadata = JSON.parse(transaction.metadataJson);
      const profitLossAmount = Number(metadata.profitLossAmount ?? 0);
      return sum + Math.max(profitLossAmount, 0);
    } catch {
      return sum;
    }
  }, 0);

  return {
    welcome: {
      fullName: user.fullName
    },
    balance: {
      availableBalance: user.availableBalance,
      totalInvested: user.totalInvested,
      totalProfit: user.totalProfit,
      monthlyProfit
    },
    recentTransactions
  };
}
