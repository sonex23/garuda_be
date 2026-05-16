import { TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';

const ewalletMethod = {
  fee: 1500,
  details: {
    provider: 'GoPay',
    accountNumber: '081234567890',
    accountName: 'PT Garuda Investment'
  }
} as const;

async function getBankMethodConfig() {
  const primaryAccount =
    (await prisma.companyBankAccount.findFirst({
      where: { isActive: true, isPrimary: true },
      orderBy: { createdAt: 'asc' }
    })) ||
    (await prisma.companyBankAccount.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    }));

  if (!primaryAccount) {
    throw new AppError('Rekening perusahaan untuk top up bank belum tersedia', 400);
  }

  return {
    fee: 0,
    details: {
      bankName: primaryAccount.bankName,
      accountNumber: primaryAccount.accountNumber,
      accountName: primaryAccount.accountName,
      branch: primaryAccount.branch ?? undefined
    }
  } as const;
}

export async function createTopUp(userId: string, payload: { amount: number; method: 'bank' | 'ewallet' }) {
  const methodConfig = payload.method === 'bank' ? await getBankMethodConfig() : ewalletMethod;

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: TransactionType.TOPUP,
      title: payload.method === 'bank' ? 'Top Up via Bank Transfer' : 'Top Up via E-Wallet',
      amount: payload.amount,
      fee: methodConfig.fee,
      paymentMethod: payload.method,
      metadataJson: JSON.stringify(methodConfig.details),
      status: TransactionStatus.PENDING
    }
  });

  return {
    id: transaction.id,
    amount: transaction.amount,
    fee: transaction.fee,
    total: transaction.amount + transaction.fee,
    method: payload.method,
    details: methodConfig.details,
    status: transaction.status.toLowerCase()
  };
}

export async function uploadTopUpProof(userId: string, transactionId: string, proofImageUrl: string) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
      type: TransactionType.TOPUP
    }
  });

  if (!transaction) {
    throw new AppError('Data top up tidak ditemukan', 404);
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      proofImageUrl,
      status: TransactionStatus.PROCESSING
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      title: 'Top Up Diproses',
      message: `Bukti top up Rp ${transaction.amount.toLocaleString('id-ID')} telah diterima dan sedang diproses.`,
      type: 'INFO'
    }
  });

  return {
    id: updated.id,
    status: updated.status.toLowerCase(),
    proofImageUrl: updated.proofImageUrl
  };
}
