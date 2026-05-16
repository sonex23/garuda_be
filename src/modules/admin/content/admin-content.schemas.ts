import { z } from 'zod';

export const broadcastSchema = z.object({
  title: z.string().min(3).max(120),
  message: z.string().min(5).max(500),
  type: z.enum(['SUCCESS', 'INFO', 'MARKET', 'UPDATE', 'SECURITY']).optional().default('INFO')
});

export const faqSchema = z.object({
  question: z.string().min(5).max(200),
  answer: z.string().min(5).max(1000),
  order: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true)
});

export const supportContactSchema = z.object({
  type: z.enum(['WHATSAPP', 'TELEGRAM']),
  label: z.string().min(3).max(50),
  value: z.string().min(3).max(120),
  href: z.string().url(),
  description: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true)
});

export const companyBankAccountSchema = z.object({
  bankName: z.string().min(3).max(100),
  accountNumber: z.string().min(5).max(50),
  accountName: z.string().min(3).max(120),
  branch: z.string().max(120).optional().nullable(),
  isActive: z.boolean().default(true),
  isPrimary: z.boolean().default(false)
});


export const winnerListItemSchema = z.object({
  type: z.enum(['sell', 'buy', 'transfer']).default('sell'),
  name: z.string().min(2).max(100),
  amount: z.number().int().positive(),
  winDate: z.coerce.date(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true)
});
