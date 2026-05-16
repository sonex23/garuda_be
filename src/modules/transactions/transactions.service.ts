import { prisma } from '../../lib/prisma.js';

export async function getTransactions(userId: string, type = 'all') {
  const mapping: Record<string, 'TOPUP' | 'BUY' | 'SELL' | 'WITHDRAWAL'> = {
    topup: 'TOPUP',
    buy: 'BUY',
    sell: 'SELL',
    withdrawal: 'WITHDRAWAL'
  };

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(type !== 'all' ? { type: mapping[type] } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: { asset: true }
  });

  return transactions.map((item) => ({
    id: item.id,
    type: item.type.toLowerCase(),
    name: item.title,
    amount: item.amount,
    fee: item.fee,
    status: item.status.toLowerCase(),
    date: item.createdAt.toISOString().split('T')[0],
    time: new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(item.createdAt),
    outcomeType: item.assetOutcomeType?.toLowerCase() ?? null,
    outcomeAmount: item.assetOutcomeAmount,
    outcomePercentage: item.assetOutcomePercentage,
    outcomeNote: item.assetOutcomeNote ?? null,
    outcomeSettledAt: item.assetOutcomeSettledAt?.toISOString() ?? null,
    assetSymbol: item.asset?.symbol ?? null
  }));
}
