import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import {
  getCompanyBankAccounts,
  getFaqs,
  getSupportContacts,
  getWinnerListItems,
  patchCompanyBankAccount,
  patchFaq,
  patchSupportContact,
  patchWinnerListItem,
  postBroadcast,
  postCompanyBankAccount,
  postFaq,
  postSupportContact,
  postWinnerListItem,
  removeCompanyBankAccount,
  removeFaq,
  removeSupportContact,
  removeWinnerListItem
} from './admin-content.controller.js';

export const adminContentRouter = Router();

adminContentRouter.use(requireAdmin);
adminContentRouter.post('/broadcasts', postBroadcast);

adminContentRouter.get('/faqs', getFaqs);
adminContentRouter.post('/faqs', postFaq);
adminContentRouter.patch('/faqs/:faqId', patchFaq);
adminContentRouter.delete('/faqs/:faqId', removeFaq);

adminContentRouter.get('/support-contacts', getSupportContacts);
adminContentRouter.post('/support-contacts', postSupportContact);
adminContentRouter.patch('/support-contacts/:contactId', patchSupportContact);
adminContentRouter.delete('/support-contacts/:contactId', removeSupportContact);

adminContentRouter.get('/company-bank-accounts', getCompanyBankAccounts);
adminContentRouter.post('/company-bank-accounts', postCompanyBankAccount);
adminContentRouter.patch('/company-bank-accounts/:accountId', patchCompanyBankAccount);
adminContentRouter.delete('/company-bank-accounts/:accountId', removeCompanyBankAccount);

adminContentRouter.get('/winners', getWinnerListItems);
adminContentRouter.post('/winners', postWinnerListItem);
adminContentRouter.patch('/winners/:winnerId', patchWinnerListItem);
adminContentRouter.delete('/winners/:winnerId', removeWinnerListItem);
