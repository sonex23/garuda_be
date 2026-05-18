import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { broadcastSchema, companyBankAccountSchema, faqSchema, supportContactSchema, winnerListItemSchema } from './admin-content.schemas.js';
import {
  broadcastNotification,
  createCompanyBankAccount,
  createFaq,
  createSupportContact,
  deleteCompanyBankAccount,
  deleteFaq,
  deleteSupportContact,
  listCompanyBankAccounts,
  listFaqs,
  listSupportContacts,
  listWinnerListItems,
  updateCompanyBankAccount,
  updateFaq,
  updateSupportContact,
  updateWinnerListItem,
  createWinnerListItem,
  deleteWinnerListItem
} from './admin-content.service.js';

export async function postBroadcast(req: AuthenticatedRequest, res: Response) {
  const payload = broadcastSchema.parse(req.body);
  const result = await broadcastNotification(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function getFaqs(_req: AuthenticatedRequest, res: Response) {
  const result = await listFaqs();
  res.json(result);
}

export async function postFaq(req: AuthenticatedRequest, res: Response) {
  const payload = faqSchema.parse(req.body);
  const result = await createFaq(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function patchFaq(req: AuthenticatedRequest, res: Response) {
  const payload = faqSchema.parse(req.body);
  const result = await updateFaq(req.user!.userId, req.params.faqId as string, payload);
  res.json(result);
}

export async function removeFaq(req: AuthenticatedRequest, res: Response) {
  const result = await deleteFaq(req.user!.userId, req.params.faqId as string);
  res.json(result);
}

export async function getSupportContacts(_req: AuthenticatedRequest, res: Response) {
  const result = await listSupportContacts();
  res.json(result);
}

export async function postSupportContact(req: AuthenticatedRequest, res: Response) {
  const payload = supportContactSchema.parse(req.body);
  const result = await createSupportContact(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function patchSupportContact(req: AuthenticatedRequest, res: Response) {
  const payload = supportContactSchema.parse(req.body);
  const result = await updateSupportContact(req.user!.userId, req.params.contactId as string, payload);
  res.json(result);
}

export async function removeSupportContact(req: AuthenticatedRequest, res: Response) {
  const result = await deleteSupportContact(req.user!.userId, req.params.contactId as string);
  res.json(result);
}

export async function getCompanyBankAccounts(_req: AuthenticatedRequest, res: Response) {
  const result = await listCompanyBankAccounts();
  res.json(result);
}

export async function postCompanyBankAccount(req: AuthenticatedRequest, res: Response) {
  const payload = companyBankAccountSchema.parse(req.body);
  const result = await createCompanyBankAccount(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function patchCompanyBankAccount(req: AuthenticatedRequest, res: Response) {
  const payload = companyBankAccountSchema.parse(req.body);
  const result = await updateCompanyBankAccount(req.user!.userId, req.params.accountId as string, payload);
  res.json(result);
}

export async function removeCompanyBankAccount(req: AuthenticatedRequest, res: Response) {
  const result = await deleteCompanyBankAccount(req.user!.userId, req.params.accountId as string);
  res.json(result);
}


export async function getWinnerListItems(_req: AuthenticatedRequest, res: Response) {
  const result = await listWinnerListItems();
  res.json(result);
}

export async function postWinnerListItem(req: AuthenticatedRequest, res: Response) {
  const payload = winnerListItemSchema.parse(req.body);
  const result = await createWinnerListItem(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function patchWinnerListItem(req: AuthenticatedRequest, res: Response) {
  const payload = winnerListItemSchema.parse(req.body);
  const result = await updateWinnerListItem(req.user!.userId, req.params.winnerId as string, payload);
  res.json(result);
}

export async function removeWinnerListItem(req: AuthenticatedRequest, res: Response) {
  const result = await deleteWinnerListItem(req.user!.userId, req.params.winnerId as string);
  res.json(result);
}
