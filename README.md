# Garuda Investment Backend + Admin

Backend utama untuk aplikasi user dan panel admin Garuda Investment.

## Tambahan pada versi ini
- Role user dan admin
- Endpoint admin dengan namespace `/api/admin/*`
- Approval top up
- Approval withdrawal
- Manajemen user dan verifikasi
- Broadcast notifikasi
- FAQ management
- Support thread admin reply
- Audit logs admin

## Tech Stack
- Express + TypeScript
- Prisma + SQLite
- JWT Auth
- Multer upload

## Setup
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init_admin
npm run prisma:seed
npm run dev
```

## Akun demo
### User
- Email: `budi.santoso@email.com`
- Password: `Password123!`

### Admin
- Email: `admin@garudainvestment.id`
- Password: `Admin12345!`

## Endpoint admin utama
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/refresh`
- `GET /api/admin/dashboard/summary`
- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId/verification`
- `GET /api/admin/topups`
- `PATCH /api/admin/topups/:transactionId/review`
- `GET /api/admin/withdrawals`
- `PATCH /api/admin/withdrawals/:transactionId/review`
- `GET /api/admin/transactions`
- `GET /api/admin/support/threads`
- `GET /api/admin/support/threads/:userId`
- `POST /api/admin/support/threads/:userId/reply`
- `POST /api/admin/content/broadcasts`
- `GET /api/admin/content/faqs`
- `POST /api/admin/content/faqs`
- `PATCH /api/admin/content/faqs/:faqId`
- `GET /api/admin/audit-logs`


## Upgrade production-ready pada paket ini
- Pagination server-side untuk users, topups, withdrawals, transactions, dan audit logs
- Filter server-side: search, status, tipe, verification, rentang tanggal
- Export CSV untuk laporan users, topups, withdrawals, transactions, dan audit logs
- Dashboard summary dilengkapi dataset chart:
  - volume transaksi 7 hari
  - pertumbuhan user 6 bulan
  - approval queue

Contoh endpoint baru:
- `GET /api/admin/users/export`
- `GET /api/admin/topups/export`
- `GET /api/admin/withdrawals/export`
- `GET /api/admin/transactions/export`
- `GET /api/admin/audit-logs/export`