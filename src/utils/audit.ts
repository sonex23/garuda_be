
import { AuditAction } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function logAdminAction(params: {
  adminId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  message: string;
}) {
  return prisma.auditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      message: params.message
    }
  });
}
