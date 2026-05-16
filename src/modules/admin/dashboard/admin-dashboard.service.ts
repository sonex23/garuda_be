import { TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function getAdminDashboardSummary() {
  const [
    totalUsers,
    totalAdmins,
    activeAssets,
    pendingTopups,
    pendingWithdrawals,
    totalTransactions,
    latestTransactions,
    totalDepositsAgg,
    totalWithdrawalAgg,
    last7DaysTransactions,
    allUsers
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.asset.count({ where: { isActive: true } }),
    prisma.transaction.count({ where: { type: TransactionType.TOPUP, status: { in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] } } }),
    prisma.transaction.count({ where: { type: TransactionType.WITHDRAWAL, status: { in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] } } }),
    prisma.transaction.count(),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { fullName: true, email: true } } }
    }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: TransactionType.TOPUP, status: TransactionStatus.SUCCESS } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.SUCCESS } }),
    prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: (() => {
            const date = new Date();
            date.setDate(date.getDate() - 6);
            date.setHours(0, 0, 0, 0);
            return date;
          })()
        }
      },
      select: { createdAt: true, amount: true, type: true }
    }),
    prisma.user.findMany({
      where: { role: 'USER' },
      select: { createdAt: true }
    })
  ]);

  const dailyMap = new Map<string, { label: string; totalAmount: number; totalCount: number; topups: number; withdrawals: number }>();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = formatDateKey(date);
    dailyMap.set(key, {
      label: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      totalAmount: 0,
      totalCount: 0,
      topups: 0,
      withdrawals: 0
    });
  }
  for (const transaction of last7DaysTransactions) {
    const key = formatDateKey(transaction.createdAt);
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.totalAmount += transaction.amount;
    bucket.totalCount += 1;
    if (transaction.type === TransactionType.TOPUP) bucket.topups += transaction.amount;
    if (transaction.type === TransactionType.WITHDRAWAL) bucket.withdrawals += transaction.amount;
  }

  const monthlyMap = new Map<string, { label: string; totalUsers: number }>();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i, 1);
    const key = formatMonthKey(date);
    monthlyMap.set(key, {
      label: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      totalUsers: 0
    });
  }
  for (const user of allUsers) {
    const key = formatMonthKey(user.createdAt);
    const bucket = monthlyMap.get(key);
    if (bucket) bucket.totalUsers += 1;
  }

  return {
    stats: {
      totalUsers,
      totalAdmins,
      activeAssets,
      pendingTopups,
      pendingWithdrawals,
      totalTransactions,
      totalDeposits: totalDepositsAgg._sum.amount ?? 0,
      totalWithdrawals: totalWithdrawalAgg._sum.amount ?? 0
    },
    charts: {
      transactionVolume7d: Array.from(dailyMap.values()),
      userGrowth6m: Array.from(monthlyMap.values()),
      approvalQueue: [
        { label: 'Pending Top Up', total: pendingTopups },
        { label: 'Pending Withdrawal', total: pendingWithdrawals }
      ]
    },
    latestTransactions: latestTransactions.map((item) => ({
      id: item.id,
      userName: item.user.fullName,
      userEmail: item.user.email,
      title: item.title,
      type: item.type.toLowerCase(),
      amount: item.amount,
      status: item.status.toLowerCase(),
      createdAt: item.createdAt
    }))
  };
}