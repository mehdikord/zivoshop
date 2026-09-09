-- CreateTable
CREATE TABLE `media_folders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `media_folders_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `folder_id` BIGINT UNSIGNED NULL,
    `filename` VARCHAR(255) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'image',
    `mime_type` VARCHAR(100) NULL,
    `size` INTEGER NOT NULL DEFAULT 0,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `alt` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `media_folder_id_idx`(`folder_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_folder_id_fkey` FOREIGN KEY (`folder_id`) REFERENCES `media_folders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
