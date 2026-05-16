import { prisma } from '../../lib/prisma.js';
import { buildNotificationTime } from '../../utils/formatters.js';

export async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return notifications.map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    time: buildNotificationTime(item.createdAt),
    read: item.read,
    type: item.type.toLowerCase()
  }));
}

export async function markNotificationAsRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true }
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
}
