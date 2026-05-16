import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import { AppError } from '../../../middleware/error-handler.js';
import { logAdminAction } from '../../../utils/audit.js';
import { buildPaginatedResult, getDateRange, normalizeSearch } from '../../../utils/pagination.js';

type UserListParams = {
  search?: string;
  verification?: string;
  page: number;
  pageSize: number;
};

export async function listUsers(params: UserListParams) {
  const search = normalizeSearch(params.search);
  const where: Prisma.UserWhereInput = {
    role: 'USER',
    ...(search ? {
      OR: [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    } : {}),
    ...(params.verification === 'verified' ? { isVerified: true } : {}),
    ...(params.verification === 'unverified' ? { isVerified: false } : {})
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        _count: {
          select: { transactions: true, notifications: true }
        }
      }
    })
  ]);

  return buildPaginatedResult(users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role.toLowerCase(),
    membershipTier: user.membershipTier,
    isVerified: user.isVerified,
    availableBalance: user.availableBalance,
    totalInvested: user.totalInvested,
    totalProfit: user.totalProfit,
    createdAt: user.createdAt,
    transactionCount: user._count.transactions
  })), total, params.page, params.pageSize);
}

export async function exportUsers(params: Omit<UserListParams, 'page' | 'pageSize'>) {
  const search = normalizeSearch(params.search);
  const where: Prisma.UserWhereInput = {
    role: 'USER',
    ...(search ? {
      OR: [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    } : {}),
    ...(params.verification === 'verified' ? { isVerified: true } : {}),
    ...(params.verification === 'unverified' ? { isVerified: false } : {})
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { transactions: true } } }
  });

  return users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
    membershipTier: user.membershipTier,
    isVerified: user.isVerified ? 'verified' : 'unverified',
    availableBalance: user.availableBalance,
    totalInvested: user.totalInvested,
    totalProfit: user.totalProfit,
    transactionCount: user._count.transactions,
    createdAt: user.createdAt.toISOString()
  }));
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      holdings: { include: { asset: true } },
      transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      notificationSettings: true
    }
  });

  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role.toLowerCase(),
    membershipTier: user.membershipTier,
    isVerified: user.isVerified,
    availableBalance: user.availableBalance,
    totalInvested: user.totalInvested,
    totalProfit: user.totalProfit,
    monthlyProfit: user.monthlyProfit,
    createdAt: user.createdAt,
    holdings: user.holdings.map((holding) => ({
      id: holding.id,
      symbol: holding.asset.symbol,
      name: holding.asset.name,
      investedAmount: holding.investedAmount,
      currentValue: holding.currentValue,
      units: holding.units
    })),
    transactions: user.transactions.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type.toLowerCase(),
      amount: item.amount,
      status: item.status.toLowerCase(),
      createdAt: item.createdAt
    })),
    notificationSettings: user.notificationSettings
  };
}

export async function updateUserVerification(adminId: string, userId: string, isVerified: boolean) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isVerified }
  });

  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'USER',
    entityId: user.id,
    message: `${isVerified ? 'Memverifikasi' : 'Membatalkan verifikasi'} user ${user.email}`
  });

  return {
    id: user.id,
    isVerified: user.isVerified
  };
}