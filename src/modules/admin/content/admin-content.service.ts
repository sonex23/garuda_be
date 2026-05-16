import { prisma } from '../../../lib/prisma.js';
import { AppError } from '../../../middleware/error-handler.js';
import { logAdminAction } from '../../../utils/audit.js';

type BroadcastPayload = {
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'MARKET' | 'UPDATE' | 'SECURITY';
};

type FaqPayload = {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
};

type SupportContactPayload = {
  type: 'WHATSAPP' | 'TELEGRAM';
  label: string;
  value: string;
  href: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

type CompanyBankAccountPayload = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string | null;
  isActive: boolean;
  isPrimary: boolean;
};

type WinnerListItemPayload = {
  type: 'sell' | 'buy' | 'transfer';
  name: string;
  amount: number;
  winDate: Date;
  sortOrder: number;
  isActive: boolean;
};

export async function broadcastNotification(adminId: string, payload: BroadcastPayload) {
  const users = await prisma.user.findMany({ where: { role: 'USER' }, select: { id: true } });

  if (users.length === 0) {
    return { sent: 0 };
  }

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title: payload.title,
      message: payload.message,
      type: payload.type
    }))
  });

  await logAdminAction({
    adminId,
    action: 'BROADCAST',
    entityType: 'NOTIFICATION',
    message: `Broadcast notifikasi "${payload.title}" ke ${users.length} user`
  });

  return { sent: users.length };
}

export async function listFaqs() {
  const faqs = await prisma.supportFaq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  return { items: faqs };
}

export async function createFaq(adminId: string, payload: FaqPayload) {
  const faq = await prisma.supportFaq.create({ data: payload });
  await logAdminAction({
    adminId,
    action: 'CREATE',
    entityType: 'FAQ',
    entityId: faq.id,
    message: 'Membuat FAQ baru'
  });
  return faq;
}

export async function updateFaq(adminId: string, faqId: string, payload: FaqPayload) {
  const existing = await prisma.supportFaq.findUnique({ where: { id: faqId } });
  if (!existing) throw new AppError('FAQ tidak ditemukan', 404);
  const faq = await prisma.supportFaq.update({ where: { id: faqId }, data: payload });
  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'FAQ',
    entityId: faq.id,
    message: `Mengubah FAQ ${faq.id}`
  });
  return faq;
}

export async function deleteFaq(adminId: string, faqId: string) {
  const existing = await prisma.supportFaq.findUnique({ where: { id: faqId } });
  if (!existing) throw new AppError('FAQ tidak ditemukan', 404);

  await prisma.supportFaq.delete({ where: { id: faqId } });
  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'FAQ',
    entityId: faqId,
    message: `Menghapus FAQ ${faqId}`
  });

  return { message: 'FAQ berhasil dihapus' };
}

export async function listSupportContacts() {
  const items = await prisma.supportContact.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  });
  return { items };
}

export async function createSupportContact(adminId: string, payload: SupportContactPayload) {
  const item = await prisma.supportContact.create({ data: payload });
  await logAdminAction({
    adminId,
    action: 'CREATE',
    entityType: 'SUPPORT_CONTACT',
    entityId: item.id,
    message: `Membuat kontak support ${item.type}`
  });
  return item;
}

export async function updateSupportContact(adminId: string, contactId: string, payload: SupportContactPayload) {
  const existing = await prisma.supportContact.findUnique({ where: { id: contactId } });
  if (!existing) throw new AppError('Kontak support tidak ditemukan', 404);

  const item = await prisma.supportContact.update({
    where: { id: contactId },
    data: payload
  });

  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'SUPPORT_CONTACT',
    entityId: item.id,
    message: `Mengubah kontak support ${item.type}`
  });

  return item;
}

export async function deleteSupportContact(adminId: string, contactId: string) {
  const existing = await prisma.supportContact.findUnique({ where: { id: contactId } });
  if (!existing) throw new AppError('Kontak support tidak ditemukan', 404);

  await prisma.supportContact.delete({ where: { id: contactId } });
  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'SUPPORT_CONTACT',
    entityId: contactId,
    message: `Menghapus kontak support ${contactId}`
  });

  return { message: 'Kontak support berhasil dihapus' };
}

export async function listCompanyBankAccounts() {
  const items = await prisma.companyBankAccount.findMany({
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
  });
  return { items };
}

async function clearPrimaryFlag(exceptId?: string) {
  await prisma.companyBankAccount.updateMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    data: { isPrimary: false }
  });
}

export async function createCompanyBankAccount(adminId: string, payload: CompanyBankAccountPayload) {
  if (payload.isPrimary) {
    await clearPrimaryFlag();
  }

  const item = await prisma.companyBankAccount.create({ data: payload });
  await logAdminAction({
    adminId,
    action: 'CREATE',
    entityType: 'COMPANY_BANK_ACCOUNT',
    entityId: item.id,
    message: `Membuat rekening perusahaan ${item.bankName}`
  });
  return item;
}

export async function updateCompanyBankAccount(adminId: string, accountId: string, payload: CompanyBankAccountPayload) {
  const existing = await prisma.companyBankAccount.findUnique({ where: { id: accountId } });
  if (!existing) throw new AppError('Rekening perusahaan tidak ditemukan', 404);

  if (payload.isPrimary) {
    await clearPrimaryFlag(accountId);
  }

  const item = await prisma.companyBankAccount.update({
    where: { id: accountId },
    data: payload
  });

  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'COMPANY_BANK_ACCOUNT',
    entityId: item.id,
    message: `Mengubah rekening perusahaan ${item.bankName}`
  });

  return item;
}

export async function deleteCompanyBankAccount(adminId: string, accountId: string) {
  const existing = await prisma.companyBankAccount.findUnique({ where: { id: accountId } });
  if (!existing) throw new AppError('Rekening perusahaan tidak ditemukan', 404);

  await prisma.companyBankAccount.delete({ where: { id: accountId } });
  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'COMPANY_BANK_ACCOUNT',
    entityId: accountId,
    message: `Menghapus rekening perusahaan ${accountId}`
  });

  return { message: 'Rekening perusahaan berhasil dihapus' };
}


export async function listWinnerListItems() {
  const items = await prisma.winnerListItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { winDate: 'desc' }, { createdAt: 'desc' }]
  });
  return { items };
}

export async function createWinnerListItem(adminId: string, payload: WinnerListItemPayload) {
  const item = await prisma.winnerListItem.create({ data: payload });
  await logAdminAction({
    adminId,
    action: 'CREATE',
    entityType: 'WINNER_LIST',
    entityId: item.id,
    message: `Membuat winner list ${item.name}`
  });
  return item;
}

export async function updateWinnerListItem(adminId: string, itemId: string, payload: WinnerListItemPayload) {
  const existing = await prisma.winnerListItem.findUnique({ where: { id: itemId } });
  if (!existing) throw new AppError('Winner list tidak ditemukan', 404);

  const item = await prisma.winnerListItem.update({
    where: { id: itemId },
    data: payload
  });

  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'WINNER_LIST',
    entityId: item.id,
    message: `Mengubah winner list ${item.name}`
  });

  return item;
}

export async function deleteWinnerListItem(adminId: string, itemId: string) {
  const existing = await prisma.winnerListItem.findUnique({ where: { id: itemId } });
  if (!existing) throw new AppError('Winner list tidak ditemukan', 404);

  await prisma.winnerListItem.delete({ where: { id: itemId } });
  await logAdminAction({
    adminId,
    action: 'UPDATE',
    entityType: 'WINNER_LIST',
    entityId: itemId,
    message: `Menghapus winner list ${existing.name}`
  });

  return { message: 'Winner list berhasil dihapus' };
}
