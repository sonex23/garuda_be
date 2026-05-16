import type { Prisma } from '@prisma/client';

export function parsePaginationParams(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}

export function buildPaginatedResult<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  };
}

export function normalizeSearch(search?: string) {
  const value = search?.trim();
  return value ? value : undefined;
}

export function getDateRange(fromDate?: string, toDate?: string) {
  const range: Prisma.DateTimeFilter = {};
  if (fromDate) {
    const from = new Date(fromDate);
    if (!Number.isNaN(from.getTime())) range.gte = from;
  }
  if (toDate) {
    const to = new Date(toDate);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      range.lte = to;
    }
  }
  return Object.keys(range).length ? range : undefined;
}