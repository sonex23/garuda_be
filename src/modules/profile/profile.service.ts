import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { comparePassword, hashPassword } from '../../utils/password.js';

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationSettings: true }
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
    membershipTier: user.membershipTier,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    notificationSettings: user.notificationSettings
  };
}

export async function updateCurrentUser(userId: string, payload: {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new AppError('User tidak ditemukan', 404);
  }

  if (payload.email && payload.email !== existingUser.email) {
    const duplicateUser = await prisma.user.findUnique({ where: { email: payload.email } });
    if (duplicateUser) {
      throw new AppError('Email sudah digunakan', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: payload
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address
  };
}

export async function updatePassword(
  userId: string,
  payload: { currentPassword: string; newPassword: string; confirmPassword: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  const passwordValid = await comparePassword(payload.currentPassword, user.passwordHash);
  if (!passwordValid) {
    throw new AppError('Password saat ini salah', 400);
  }

  const passwordHash = await hashPassword(payload.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  await prisma.notification.create({
    data: {
      userId,
      title: 'Keamanan Akun',
      message: 'Password Anda telah berhasil diubah.',
      type: 'SECURITY'
    }
  });

  return { message: 'Password berhasil diubah' };
}

export async function getNotificationSettings(userId: string) {
  const settings = await prisma.notificationSettings.findUnique({ where: { userId } });
  if (!settings) {
    throw new AppError('Pengaturan notifikasi tidak ditemukan', 404);
  }
  return settings;
}

export async function updateNotificationSettings(
  userId: string,
  payload: { emailNotifications: boolean; appNotifications: boolean; smsNotifications: boolean }
) {
  return prisma.notificationSettings.upsert({
    where: { userId },
    update: payload,
    create: {
      userId,
      ...payload
    }
  });
}
