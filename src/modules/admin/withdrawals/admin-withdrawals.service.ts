import { Prisma, TransactionStatus, TransactionType, NotificationType } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import { AppError } from '../../../middleware/error-handler.js';
import { logAdminAction } from '../../../utils/audit.js';
import { buildPaginatedResult, getDateRange, normalizeSearch } from '../../../utils/pagination.js';

type WithdrawalListParams = {
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};

function buildWhere(params: Partial<WithdrawalListParams>): Prisma.TransactionWhereInput {
  const search = normalizeSearch(params.search);
  return {
    type: TransactionType.WITHDRAWAL,
    ...(params.status ? { status: params.status.toUpperCase() as TransactionStatus } : {}),
    ...(search ? {
      OR: [
        { user: { is: { fullName: { contains: search } } } },
        { user: { is: { email: { contains: search } } } },
        { destinationName: { contains: search } },
        { accountName: { contains: search } },
        { accountNumber: { contains: search } }
      ]
    } : {}),
    ...(getDateRange(params.fromDate, params.toDate) ? { createdAt: getDateRange(params.fromDate, params.toDate) } : {})
  };
}

export async function listWithdrawals(params: WithdrawalListParams) {
  const where = buildWhere(params);
  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        user: { select: { fullName: true, email: true } }
      }
    })
  ]);

  return buildPaginatedResult(items.map((item) => ({
    id: item.id,
    userName: item.user.fullName,
    userEmail: item.user.email,
    amount: item.amount,
    fee: item.fee,
    destinationType: item.destinationType,
    destinationName: item.destinationName,
    accountNumber: item.accountNumber,
    accountName: item.accountName,
    status: item.status.toLowerCase(),
    reviewedAt: item.reviewedAt,
    reviewNote: item.reviewNote,
    createdAt: item.createdAt
  })), total, params.page, params.pageSize);
}

export async function exportWithdrawals(params: Omit<WithdrawalListParams, 'page' | 'pageSize'>) {
  const items = await prisma.transaction.findMany({
    where: buildWhere(params),
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true } }
    }
  });

  return items.map((item) => ({
    id: item.id,
    userName: item.user.fullName,
    userEmail: item.user.email,
    amount: item.amount,
    fee: item.fee,
    destinationType: item.destinationType ?? '',
    destinationName: item.destinationName ?? '',
    accountNumber: item.accountNumber ?? '',
    accountName: item.accountName ?? '',
    status: item.status.toLowerCase(),
    reviewedAt: item.reviewedAt?.toISOString() ?? '',
    reviewNote: item.reviewNote ?? '',
    createdAt: item.createdAt.toISOString()
  }));
}

export async function reviewWithdrawal(adminId: string, transactionId: string, payload: { action: 'approve' | 'reject'; note?: string }) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { user: true } });
  if (!transaction || transaction.type !== TransactionType.WITHDRAWAL) {
    throw new AppError('Withdrawal tidak ditemukan', 404);
  }

  if (transaction.status === TransactionStatus.SUCCESS || transaction.status === TransactionStatus.FAILED) {
    throw new AppError('Withdrawal ini sudah selesai direview', 400);
  }

  const nextStatus = payload.action === 'approve' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;
  const title = payload.action === 'approve' ? 'Withdrawal Disetujui' : 'Withdrawal Ditolak';
  const message = payload.action === 'approve'
    ? `Penarikan Rp ${transaction.amount.toLocaleString('id-ID')} telah disetujui admin.`
    : `Penarikan Rp ${transaction.amount.toLocaleString('id-ID')} ditolak admin. ${payload.note ?? ''}`.trim();

  const totalRefund = transaction.amount + transaction.fee;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTx = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: nextStatus,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
        reviewNote: payload.note
      }
    });

    if (payload.action === 'reject') {
      await tx.user.update({
        where: { id: transaction.userId },
        data: { availableBalance: { increment: totalRefund } }
      });
    }

    await tx.notification.create({
      data: {
        userId: transaction.userId,
        title,
        message,
        type: payload.action === 'approve' ? NotificationType.SUCCESS : NotificationType.INFO
      }
    });

    return updatedTx;
  });

  await logAdminAction({
    adminId,
    action: payload.action === 'approve' ? 'APPROVE' : 'REJECT',
    entityType: 'WITHDRAWAL',
    entityId: updated.id,
    message: `${payload.action === 'approve' ? 'Menyetujui' : 'Menolak'} withdrawal ${updated.id}`
  });

  return {
    id: updated.id,
    status: updated.status.toLowerCase()
  };
}