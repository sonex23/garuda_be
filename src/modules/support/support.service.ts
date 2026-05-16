import { SupportSender } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export async function getFaqs() {
  return prisma.supportFaq.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
}

export async function getSupportInfo() {
  const [contacts, companyBankAccounts] = await Promise.all([
    prisma.supportContact.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    }),
    prisma.companyBankAccount.findMany({
      where: { isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    })
  ]);

  return { contacts, companyBankAccounts };
}

export async function getChatMessages(userId: string) {
  return prisma.supportChatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });
}

export async function createChatMessage(userId: string, message: string) {
  const userMessage = await prisma.supportChatMessage.create({
    data: {
      userId,
      sender: SupportSender.USER,
      message
    }
  });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentSupportMessage = await prisma.supportChatMessage.findFirst({
    where: {
      userId,
      sender: SupportSender.SUPPORT,
      createdAt: {
        gte: oneDayAgo
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!recentSupportMessage) {
    await prisma.supportChatMessage.create({
      data: {
        userId,
        sender: SupportSender.SUPPORT,
        message: 'Terima kasih. Tim support kami sudah menerima pesan Anda dan akan merespons secepatnya.'
      }
    });
  }

  return userMessage;
}


export async function getWinnerList() {
  return prisma.winnerListItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { winDate: 'desc' }, { createdAt: 'desc' }]
  });
}
