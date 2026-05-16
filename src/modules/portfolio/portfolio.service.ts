import { NotificationType, TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';

type PortfolioChartPoint = {
  month: string;
  value: number;
};

function getFallbackChartData(): PortfolioChartPoint[] {
  return [
    { month: 'Jan', value: 2500 },
    { month: 'Feb', value: 2650 },
    { month: 'Mar', value: 2780 },
    { month: 'Apr', value: 3120 },
    { month: 'Mei', value: 3450 }
  ];
}

export async function getPortfolio(userId: string) {
  const [user, holdings, assets] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.holding.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: { currentValue: 'desc' }
    }),
    prisma.asset.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' }
    })
  ]);

  return {
    userBalance: user.availableBalance,
    chartData: getFallbackChartData(),
    holdings: holdings.map((holding) => ({
      id: holding.id,
      symbol: holding.asset.symbol,
      name: holding.asset.name,
      category: holding.asset.category,
      investedAmount: holding.investedAmount,
      currentValue: holding.currentValue,
      units: holding.units,
      avgBuyPrice: holding.avgBuyPrice,
      priceChangePct: holding.asset.priceChangePct
    })),
    availableAssets: assets
  };
}

export async function createInvestment(userId: string, payload: { assetSymbol: string; amount: number }) {
  const [user, asset] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.asset.findUnique({ where: { symbol: payload.assetSymbol } })
  ]);

  if (!asset) {
    throw new AppError('Aset tidak ditemukan', 404);
  }

  if (payload.amount > user.availableBalance) {
    throw new AppError('Saldo tidak mencukupi', 400);
  }

  const units = Number((payload.amount / asset.currentPrice).toFixed(4));

  const holding = await prisma.holding.upsert({
    where: {
      userId_assetId: {
        userId,
        assetId: asset.id
      }
    },
    update: {
      investedAmount: { increment: payload.amount },
      currentValue: { increment: payload.amount },
      units: { increment: units }
    },
    create: {
      userId,
      assetId: asset.id,
      investedAmount: payload.amount,
      currentValue: payload.amount,
      units,
      avgBuyPrice: asset.currentPrice
    },
    include: { asset: true }
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        availableBalance: { decrement: payload.amount },
        totalInvested: { increment: payload.amount }
      }
    }),
    prisma.transaction.create({
      data: {
        userId,
        assetId: asset.id,
        type: TransactionType.BUY,
        title: `Pembelian ${asset.symbol}`,
        amount: payload.amount,
        status: TransactionStatus.SUCCESS
      }
    }),
    prisma.notification.create({
      data: {
        userId,
        title: 'Investasi Berhasil',
        message: `Pembelian aset ${asset.symbol} sebesar Rp ${payload.amount.toLocaleString('id-ID')} berhasil diproses.`,
        type: NotificationType.SUCCESS
      }
    })
  ]);

  return {
    message: 'Investasi berhasil dibuat',
    holding
  };
}

export async function sellHolding(
  userId: string,
  holdingId: string,
  payload: { sellType: 'take_profit' | 'stop_loss' }
) {
  const holding = await prisma.holding.findFirst({
    where: {
      id: holdingId,
      userId
    },
    include: {
      asset: true,
      user: true
    }
  });

  if (!holding) {
    throw new AppError('Holding asset tidak ditemukan', 404);
  }

  const proceeds = Math.max(holding.currentValue, 0);
  const sellLabel = payload.sellType === 'take_profit' ? 'Take Profit' : 'Stop Loss';
  const profitLossAmount = holding.currentValue - holding.investedAmount;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        availableBalance: { increment: proceeds },
        totalInvested: { decrement: holding.investedAmount },
        totalProfit: { increment: profitLossAmount }
      }
    });

    await tx.transaction.create({
      data: {
        userId,
        assetId: holding.assetId,
        type: TransactionType.SELL,
        title: `Penjualan ${holding.asset.symbol} (${sellLabel})`,
        amount: proceeds,
        status: TransactionStatus.SUCCESS,
        metadataJson: JSON.stringify({
          sellType: payload.sellType,
          investedAmount: holding.investedAmount,
          currentValue: holding.currentValue,
          units: holding.units,
          profitLossAmount
        })
      }
    });

    await tx.notification.create({
      data: {
        userId,
        title: 'Penjualan Asset Berhasil',
        message: `Penjualan asset ${holding.asset.symbol} berhasil diproses dengan metode ${sellLabel}. Dana sebesar Rp ${proceeds.toLocaleString('id-ID')} telah masuk ke saldo akun Anda.`,
        type: NotificationType.SUCCESS
      }
    });

    await tx.holding.delete({
      where: { id: holding.id }
    });
  });

  return {
    message: `Asset ${holding.asset.symbol} berhasil dijual. Dana telah masuk ke saldo Anda.`,
    proceeds,
    soldHoldingId: holding.id
  };
}
