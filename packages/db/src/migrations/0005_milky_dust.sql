CREATE UNIQUE INDEX `images_path_unique` ON `images` (`path`);--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `filename`;--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `context`;