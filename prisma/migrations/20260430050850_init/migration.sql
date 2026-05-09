-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lapangan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `harga_per_jam` INTEGER NOT NULL,
    `kapasitas` INTEGER NOT NULL,
    `status` ENUM('TERSEDIA', 'TIDAK_TERSEDIA') NOT NULL DEFAULT 'TERSEDIA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `lapanganId` INTEGER NOT NULL,
    `nama_pemesan` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `tanggal` DATE NOT NULL,
    `jam_mulai` VARCHAR(191) NOT NULL,
    `jam_selesai` VARCHAR(191) NOT NULL,
    `durasi` INTEGER NOT NULL,
    `total_harga` INTEGER NOT NULL,
    `dp` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'KONFIRMASI', 'SELESAI', 'BATAL') NOT NULL DEFAULT 'PENDING',
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `harga_waktu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaWaktu` VARCHAR(191) NOT NULL,
    `jamMulai` INTEGER NOT NULL,
    `jamSelesai` INTEGER NOT NULL,
    `multiplier` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `nomorMember` VARCHAR(191) NOT NULL,
    `tanggalDaftar` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statusMember` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `totalBooking` INTEGER NOT NULL DEFAULT 0,
    `catatan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `member_userId_key`(`userId`),
    UNIQUE INDEX `member_nomorMember_key`(`nomorMember`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembayaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservasiId` INTEGER NOT NULL,
    `metodePembayaran` ENUM('TRANSFER_BANK', 'EWALLET', 'TUNAI') NOT NULL,
    `jumlahBayar` DECIMAL(10, 2) NOT NULL,
    `buktiPembayaran` VARCHAR(191) NULL,
    `statusPembayaran` ENUM('MENUNGGU', 'VERIFIED', 'DITOLAK') NOT NULL DEFAULT 'MENUNGGU',
    `namaBank` VARCHAR(191) NULL,
    `nomorRekening` VARCHAR(191) NULL,
    `namaPengirim` VARCHAR(191) NULL,
    `namaEwallet` VARCHAR(191) NULL,
    `nomorEwallet` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pembayaran_reservasiId_key`(`reservasiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_lapanganId_fkey` FOREIGN KEY (`lapanganId`) REFERENCES `lapangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_reservasiId_fkey` FOREIGN KEY (`reservasiId`) REFERENCES `reservasi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
