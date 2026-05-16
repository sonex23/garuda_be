import { Prisma, TransactionStatus, TransactionType, NotificationType, AssetOutcomeType } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import { AppError } from '../../../middleware/error-handler.js';
import { logAdminAction } from '../../../utils/audit.js';
import { buildPaginatedResult, getDateRange, normalizeSearch } from '../../../utils/pagination.js';

type TransactionListParams = {
  search?: string;
  type?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};

function buildWhere(params: Partial<TransactionListParams>): Prisma.TransactionWhereInput {
  const search = normalizeSearch(params.search);
  return {
    ...(params.type ? { type: params.type.toUpperCase() as TransactionType } : {}),
    ...(params.status ? { status: params.status.toUpperCase() as TransactionStatus } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search } },
        { user: { is: { fullName: { contains: search } } } },
        { user: { is: { email: { contains: search } } } },
        { asset: { is: { symbol: { contains: search } } } },
        { asset: { is: { name: { contains: search } } } }
      ]
    } : {}),
    ...(getDateRange(params.fromDate, params.toDate) ? { createdAt: getDateRange(params.fromDate, params.toDate) } : {})
  };
}

type TransactionWithRelations = Awaited<ReturnType<typeof prisma.transaction.findMany>>[number] & {
  user: { fullName: string; email: string };
  asset: { symbol: string; name: string } | null;
};

function mapTransaction(item: TransactionWithRelations) {
  return {
    id: item.id,
    userName: item.user.fullName,
    userEmail: item.user.email,
    title: item.title,
    type: item.type.toLowerCase(),
    amount: item.amount,
    fee: item.fee,
    status: item.status.toLowerCase(),
    assetSymbol: item.asset?.symbol ?? null,
    assetName: item.asset?.name ?? null,
    outcomeType: item.assetOutcomeType?.toLowerCase() ?? null,
    outcomeAmount: item.assetOutcomeAmount,
    outcomePercentage: item.assetOutcomePercentage,
    outcomeNote: item.assetOutcomeNote ?? null,
    outcomeSettledAt: item.assetOutcomeSettledAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString()
  };
}

export async function listTransactions(params: TransactionListParams) {
  const where = buildWhere(params);
  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        user: { select: { fullName: true, email: true } },
        asset: { select: { symbol: true, name: true } }
      }
    })
  ]);

  return buildPaginatedResult(items.map(mapTransaction), total, params.page, params.pageSize);
}

export async function exportTransactions(params: Omit<TransactionListParams, 'page' | 'pageSize'>) {
  const items = await prisma.transaction.findMany({
    where: buildWhere(params),
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true } },
      asset: { select: { symbol: true, name: true } }
    }
  });

  return items.map((item) => ({
    id: item.id,
    userName: item.user.fullName,
    userEmail: item.user.email,
    title: item.title,
    type: item.type.toLowerCase(),
    amount: item.amount,
    fee: item.fee,
    status: item.status.toLowerCase(),
    assetSymbol: item.asset?.symbol ?? '',
    assetName: item.asset?.name ?? '',
    outcomeType: item.assetOutcomeType?.toLowerCase() ?? '',
    outcomeAmount: item.assetOutcomeAmount,
    outcomePercentage: item.assetOutcomePercentage,
    outcomeNote: item.assetOutcomeNote ?? '',
    outcomeSettledAt: item.assetOutcomeSettledAt?.toISOString() ?? '',
    createdAt: item.createdAt.toISOString()
  }));
}

function signedOutcome(type: AssetOutcomeType | null, amount: number) {
  if (!type || !amount) return 0;
  return type === AssetOutcomeType.PROFIT ? amount : -amount;
}

export async function setAssetTransactionOutcome(
  adminId: string,
  transactionId: string,
  payload: { outcomeType: 'profit' | 'loss'; percentage: number; note?: string | null }
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: true,
      asset: true
    }
  });

  if (!transaction || transaction.type !== TransactionType.BUY) {
    throw new AppError('Transaksi asset tidak ditemukan', 404);
  }

  const nextOutcomeType = payload.outcomeType === 'profit' ? AssetOutcomeType.PROFIT : AssetOutcomeType.LOSS;
  const baseAmount = transaction.amount;
  const percentage = Math.max(0, payload.percentage);
  const computedAmount = Math.round((baseAmount * percentage) / 100);
  const previousSigned = signedOutcome(transaction.assetOutcomeType, transaction.assetOutcomeAmount);
  const nextSigned = signedOutcome(nextOutcomeType, computedAmount);
  const delta = nextSigned - previousSigned;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        assetOutcomeType: nextOutcomeType,
        assetOutcomeAmount: computedAmount,
        assetOutcomePercentage: percentage,
        assetOutcomeNote: payload.note ?? null,
        assetOutcomeSettledByAdminId: adminId,
        assetOutcomeSettledAt: new Date()
      },
      include: {
        user: { select: { fullName: true, email: true } },
        asset: { select: { symbol: true, name: true } }
      }
    });

    if (delta !== 0 && transaction.assetId) {
      const holding = await tx.holding.findUnique({
        where: {
          userId_assetId: {
            userId: transaction.userId,
            assetId: transaction.assetId
          }
        }
      });

      if (holding) {
        const nextValue = Math.max(0, holding.currentValue + delta);
        await tx.holding.update({
          where: { id: holding.id },
          data: {
            currentValue: nextValue
          }
        });
      }
    }

    const title = nextOutcomeType === AssetOutcomeType.PROFIT ? 'Nilai Asset Mengalami Keuntungan' : 'Nilai Asset Mengalami Kerugian';
    const assetName = transaction.asset?.symbol ?? transaction.title;
    const changeLabel = nextOutcomeType === AssetOutcomeType.PROFIT ? 'naik' : 'turun';
    const noteText = payload.note?.trim() ? ` Catatan admin: ${payload.note.trim()}` : '';
    await tx.notification.create({
      data: {
        userId: transaction.userId,
        title,
        message: `Nilai holding asset ${assetName} telah diperbarui admin dengan ${nextOutcomeType === AssetOutcomeType.PROFIT ? 'keuntungan' : 'kerugian'} ${percentage.toLocaleString('id-ID')}% (Rp ${computedAmount.toLocaleString('id-ID')}). Nilai asset Anda ${changeLabel}, saldo akun tidak berubah.${noteText}`,
        type: nextOutcomeType === AssetOutcomeType.PROFIT ? NotificationType.SUCCESS : NotificationType.UPDATE
      }
    });

    return updatedTransaction;
  });

  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'ASSET_TRANSACTION',
    entityId: updated.id,
    message: `Mengatur ${payload.outcomeType} transaksi asset ${updated.id} sebesar ${percentage.toLocaleString('id-ID')}% (Rp ${computedAmount.toLocaleString('id-ID')})`
  });

  return {
    message: `Hasil transaksi asset berhasil diatur sebagai ${payload.outcomeType === 'profit' ? 'keuntungan' : 'kerugian'} ${percentage.toLocaleString('id-ID')}%.`,
    item: mapTransaction(updated)
  };
}
