import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import { buildPaginatedResult, getDateRange, normalizeSearch } from '../../../utils/pagination.js';

type AuditListParams = {
  search?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};

function buildWhere(params: Partial<AuditListParams>): Prisma.AuditLogWhereInput {
  const search = normalizeSearch(params.search);
  return {
    ...(params.action ? { action: params.action.toUpperCase() as any } : {}),
    ...(params.entityType ? { entityType: params.entityType.toUpperCase() } : {}),
    ...(search ? {
      OR: [
        { message: { contains: search } },
        { admin: { is: { fullName: { contains: search } } } },
        { admin: { is: { email: { contains: search } } } }
      ]
    } : {}),
    ...(getDateRange(params.fromDate, params.toDate) ? { createdAt: getDateRange(params.fromDate, params.toDate) } : {})
  };
}

export async function listAuditLogs(params: AuditListParams) {
  const where = buildWhere(params);
  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize
    })
  ]);

  return buildPaginatedResult(logs.map((log) => ({
    id: log.id,
    adminName: log.admin.fullName,
    adminEmail: log.admin.email,
    action: log.action.toLowerCase(),
    entityType: log.entityType,
    entityId: log.entityId,
    message: log.message,
    createdAt: log.createdAt
  })), total, params.page, params.pageSize);
}

export async function exportAuditLogs(params: Omit<AuditListParams, 'page' | 'pageSize'>) {
  const logs = await prisma.auditLog.findMany({
    where: buildWhere(params),
    orderBy: { createdAt: 'desc' },
    include: {
      admin: {
        select: {
          fullName: true,
          email: true
        }
      }
    }
  });

  return logs.map((log) => ({
    id: log.id,
    adminName: log.admin.fullName,
    adminEmail: log.admin.email,
    action: log.action.toLowerCase(),
    entityType: log.entityType,
    entityId: log.entityId ?? '',
    message: log.message,
    createdAt: log.createdAt.toISOString()
  }));
}