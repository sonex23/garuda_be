
import { PrismaClient, NotificationType, SupportSender, TransactionStatus, TransactionType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@garudainvestment.id' },
    update: {
      role: UserRole.ADMIN,
      fullName: 'Admin Garuda'
    },
    create: {
      fullName: 'Admin Garuda',
      email: 'admin@garudainvestment.id',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      phone: '+62 811-1111-1111',
      address: 'Kantor Pusat Garuda Investment, Jakarta',
      membershipTier: 'Internal',
      isVerified: true,
      availableBalance: 0,
      totalInvested: 0,
      totalProfit: 0,
      monthlyProfit: 0
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'budi.santoso@email.com' },
    update: {},
    create: {
      fullName: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      passwordHash,
      role: UserRole.USER,
      phone: '+62 812-3456-7890',
      address: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
      availableBalance: 24350000,
      totalInvested: 125500000,
      totalProfit: 15750000,
      monthlyProfit: 2450000,
      notificationSettings: {
        create: {
          emailNotifications: true,
          appNotifications: true,
          smsNotifications: false
        }
      }
    }
  });

  await prisma.notificationSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      emailNotifications: true,
      appNotifications: true,
      smsNotifications: false
    }
  });

  const assets = [
    { symbol: 'BBCA', name: 'Bank Central Asia', category: 'Stock', currentPrice: 9250, priceChangePct: 2.5 },
    { symbol: 'BBRI', name: 'Bank Rakyat Indonesia', category: 'Stock', currentPrice: 4500, priceChangePct: 1.2 },
    { symbol: 'ASII', name: 'Astra International', category: 'Stock', currentPrice: 5600, priceChangePct: -0.8 },
    { symbol: 'ORI023', name: 'Obligasi ORI023', category: 'Bond', currentPrice: 10000, priceChangePct: 0.4 },
    { symbol: 'EMAS', name: 'Emas Digital', category: 'Commodity', currentPrice: 1550000, priceChangePct: 1.6 }
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: asset,
      create: asset
    });
  }

  const bbca = await prisma.asset.findUniqueOrThrow({ where: { symbol: 'BBCA' } });
  const bbri = await prisma.asset.findUniqueOrThrow({ where: { symbol: 'BBRI' } });
  const emas = await prisma.asset.findUniqueOrThrow({ where: { symbol: 'EMAS' } });

  const holdings = [
    { assetId: bbca.id, investedAmount: 45000000, currentValue: 49250000, units: 5324.0, avgBuyPrice: 8450 },
    { assetId: bbri.id, investedAmount: 25000000, currentValue: 27800000, units: 6200.0, avgBuyPrice: 4030 },
    { assetId: emas.id, investedAmount: 18000000, currentValue: 20500000, units: 13.5, avgBuyPrice: 1330000 }
  ];

  for (const holding of holdings) {
    await prisma.holding.upsert({
      where: { userId_assetId: { userId: user.id, assetId: holding.assetId } },
      update: holding,
      create: { ...holding, userId: user.id }
    });
  }


const supportContacts = [
  {
    type: 'WHATSAPP',
    label: 'WhatsApp',
    value: '6281234567890',
    href: 'https://wa.me/6281234567890',
    description: 'Hubungi tim operasional untuk bantuan cepat.',
    sortOrder: 1,
    isActive: true
  },
  {
    type: 'TELEGRAM',
    label: 'Telegram',
    value: 'garudainvestment',
    href: 'https://t.me/garudainvestment',
    description: 'Channel alternatif untuk respons dan update support.',
    sortOrder: 2,
    isActive: true
  }
];

for (const contact of supportContacts) {
  await prisma.supportContact.upsert({
    where: { type: contact.type },
    update: contact,
    create: contact
  });
}

const companyAccounts = [
  {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '1234567890',
    accountName: 'PT Garuda Investment',
    branch: 'KCU Jakarta Sudirman',
    isActive: true,
    isPrimary: true
  }
];

for (const account of companyAccounts) {
  const existingPrimary = await prisma.companyBankAccount.findFirst({
    where: { accountNumber: account.accountNumber }
  });

  if (existingPrimary) {
    await prisma.companyBankAccount.update({
      where: { id: existingPrimary.id },
      data: account
    });
  } else {
    await prisma.companyBankAccount.create({ data: account });
  }
}

  if (await prisma.notification.count({ where: { userId: user.id } }) === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: user.id, title: 'Top Up Berhasil', message: 'Top up sebesar Rp 1.000.000 telah berhasil diproses.', type: NotificationType.SUCCESS },
        { userId: user.id, title: 'Penarikan Diproses', message: 'Permintaan penarikan Rp 500.000 sedang diproses.', type: NotificationType.INFO },
        { userId: user.id, title: 'Saham BBCA Naik', message: 'Saham BBCA mengalami kenaikan 2.5% hari ini.', type: NotificationType.MARKET, read: true },
        { userId: user.id, title: 'Update Aplikasi', message: 'Versi terbaru aplikasi telah tersedia.', type: NotificationType.UPDATE, read: true }
      ]
    });
  }

  if (await prisma.supportFaq.count() === 0) {
    await prisma.supportFaq.createMany({
      data: [
        { question: 'Bagaimana cara melakukan top up saldo?', answer: 'Masuk ke menu Top Up, pilih metode pembayaran, masukkan nominal, lalu upload bukti pembayaran.', order: 1 },
        { question: 'Berapa lama proses penarikan dana?', answer: 'Proses penarikan dana membutuhkan waktu 1-3 hari kerja.', order: 2 },
        { question: 'Apakah ada biaya transaksi?', answer: 'Top up bank gratis. Penarikan dikenakan biaya admin Rp 5.000.', order: 3 }
      ]
    });
  }


  if (await prisma.winnerListItem.count() === 0) {
    await prisma.winnerListItem.createMany({
      data: [
        { type: 'sell', name: 'Joko', amount: 5000000, winDate: new Date('2026-05-05T10:30:00+07:00'), sortOrder: 1, isActive: true },
        { type: 'sell', name: 'Anwar', amount: 3200000, winDate: new Date('2026-05-04T14:15:00+07:00'), sortOrder: 2, isActive: true },
        { type: 'sell', name: 'Abimana', amount: 2500000, winDate: new Date('2026-05-03T09:45:00+07:00'), sortOrder: 3, isActive: true },
        { type: 'sell', name: 'Jeffry', amount: 450000, winDate: new Date('2026-05-02T08:00:00+07:00'), sortOrder: 4, isActive: true }
      ]
    });
  }

  if (await prisma.supportChatMessage.count({ where: { userId: user.id } }) === 0) {
    await prisma.supportChatMessage.createMany({
      data: [
        { userId: user.id, sender: SupportSender.SUPPORT, message: 'Halo! Selamat datang di Garuda Investment. Ada yang bisa kami bantu?' },
        { userId: user.id, sender: SupportSender.USER, message: 'Bagaimana cara investasi reksadana?' },
        { userId: user.id, sender: SupportSender.SUPPORT, message: 'Silakan masuk ke menu Portofolio, pilih produk, lalu tentukan nominal investasi.' }
      ]
    });
  }

  if (await prisma.transaction.count({ where: { userId: user.id } }) === 0) {
    await prisma.transaction.createMany({
      data: [
        { userId: user.id, type: TransactionType.TOPUP, title: 'Top Up via Bank BCA', amount: 10000000, status: TransactionStatus.SUCCESS, paymentMethod: 'bank' },
        { userId: user.id, type: TransactionType.BUY, title: 'Pembelian BBCA', amount: 5000000, status: TransactionStatus.SUCCESS, assetId: bbca.id },
        { userId: user.id, type: TransactionType.TOPUP, title: 'Top Up via GoPay', amount: 2500000, fee: 1500, status: TransactionStatus.PROCESSING, paymentMethod: 'ewallet', proofImageUrl: '/uploads/sample-topup-proof.png' },
        { userId: user.id, type: TransactionType.WITHDRAWAL, title: 'Penarikan ke Bank BCA', amount: 1250000, fee: 5000, status: TransactionStatus.PROCESSING, destinationType: 'bank', destinationName: 'Bank BCA', accountNumber: '1234567890', accountName: 'Budi Santoso' }
      ]
    });
  }

  if (await prisma.auditLog.count() === 0) {
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'SYSTEM',
        entityId: admin.id,
        message: 'Seed admin awal berhasil dibuat'
      }
    });
  }

  console.log('Seed berhasil dijalankan.');
  console.log('User demo:', user.email, 'Password123!');
  console.log('Admin demo:', admin.email, 'Admin12345!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
