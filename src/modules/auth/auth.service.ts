
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

function buildAuthResponse(user: { id: string; fullName: string; email: string; role: 'USER' | 'ADMIN' }) {
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });
  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new AppError('Email sudah terdaftar', 409);
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      role: 'USER',
      phone: payload.phone,
      address: payload.address,
      notificationSettings: {
        create: {
          emailNotifications: true,
          appNotifications: true,
          smsNotifications: false
        }
      }
    }
  });

  const auth = buildAuthResponse({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: auth.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return auth;
}

export async function loginUser(payload: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const passwordValid = await comparePassword(payload.password, user.passwordHash);
  if (!passwordValid) {
    throw new AppError('Email atau password salah', 401);
  }

  const auth = buildAuthResponse({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: auth.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return auth;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user || user.role !== 'ADMIN') {
    throw new AppError('Akun admin tidak ditemukan', 401);
  }

  const passwordValid = await comparePassword(payload.password, user.passwordHash);
  if (!passwordValid) {
    throw new AppError('Email atau password salah', 401);
  }

  const auth = buildAuthResponse({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });

  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: auth.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: 'LOGIN',
        entityType: 'AUTH',
        entityId: user.id,
        message: `Admin ${user.fullName} login ke panel admin`
      }
    })
  ]);

  return auth;
}

export async function refreshAccessToken(refreshToken: string) {
  const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbToken) {
    throw new AppError('Refresh token tidak valid', 401);
  }

  verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({ where: { id: dbToken.userId } });
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  return {
    accessToken: signAccessToken({ userId: user.id, email: user.email, role: user.role }),
    refreshToken
  };
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  return { message: 'Logout berhasil' };
}
