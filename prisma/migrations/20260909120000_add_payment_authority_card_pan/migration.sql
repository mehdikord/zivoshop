-- AlterTable
ALTER TABLE `payments` ADD COLUMN `authority` VARCHAR(255) NULL,
    ADD COLUMN `card_pan` VARCHAR(50) NULL;

-- CreateIndex
CREATE INDEX `payments_authority_idx` ON `payments`(`authority`);
