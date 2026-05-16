
import { prisma } from '../../../lib/prisma.js';
import { AppError } from '../../../middleware/error-handler.js';
import { logAdminAction } from '../../../utils/audit.js';

export async function listSupportThreads() {
  const users = await prisma.user.findMany({
    where: {
      chatMessages: { some: {} },
      role: 'USER'
    },
    include: {
      chatMessages: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return users.map((user) => ({
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    messagesCount: user.chatMessages.length,
    lastMessage: user.chatMessages[user.chatMessages.length - 1]?.message ?? '',
    lastMessageAt: user.chatMessages[user.chatMessages.length - 1]?.createdAt ?? null
  }));
}

export async function getSupportThread(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { chatMessages: { orderBy: { createdAt: 'asc' } } }
  });

  if (!user) {
    throw new AppError('Thread support tidak ditemukan', 404);
  }

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    },
    messages: user.chatMessages.map((item) => ({
      id: item.id,
      sender: item.sender.toLowerCase(),
      message: item.message,
      createdAt: item.createdAt
    }))
  };
}

export async function replySupportThread(adminId: string, userId: string, message: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  const reply = await prisma.$transaction(async (tx) => {
    const newMessage = await tx.supportChatMessage.create({
      data: {
        userId,
        sender: 'SUPPORT',
        message
      }
    });

    await tx.notification.create({
      data: {
        userId,
        title: 'Balasan Support',
        message,
        type: 'INFO'
      }
    });

    return newMessage;
  });

  await logAdminAction({
    adminId,
    action: 'REPLY',
    entityType: 'SUPPORT',
    entityId: reply.id,
    message: `Membalas thread support user ${user.email}`
  });

  return {
    id: reply.id,
    sender: reply.sender.toLowerCase(),
    message: reply.message,
    createdAt: reply.createdAt
  };
}
