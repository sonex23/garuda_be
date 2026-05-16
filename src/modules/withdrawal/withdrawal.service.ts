import { TransactionStatus, TransactionType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';

const withdrawalFee = 5000;

export async function createWithdrawal(userId: string, payload: {
  amount: number;
  accountType: 'bank' | 'ewallet';
  destinationName: string;
  accountNumber: string;
  accountName: string;
}) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const totalDeduction = payload.amount + withdrawalFee;

  if (totalDeduction > user.availableBalance) {
    throw new AppError('Saldo tidak mencukupi untuk penarikan', 400);
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: TransactionType.WITHDRAWAL,
      title: `Penarikan ke ${payload.destinationName}`,
      amount: payload.amount,
      fee: withdrawalFee,
      status: TransactionStatus.PROCESSING,
      destinationType: payload.accountType,
      destinationName: payload.destinationName,
      accountNumber: payload.accountNumber,
      accountName: payload.accountName
    }
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { availableBalance: { decrement: totalDeduction } }
    }),
    prisma.notification.create({
      data: {
        userId,
        title: 'Penarikan Diproses',
        message: `Permintaan penarikan Rp ${payload.amount.toLocaleString('id-ID')} sedang diproses.`,
        type: 'INFO'
      }
    })
  ]);

  return {
    id: transaction.id,
    amount: transaction.amount,
    fee: transaction.fee,
    totalDeduction,
    status: transaction.status.toLowerCase()
  };
}
