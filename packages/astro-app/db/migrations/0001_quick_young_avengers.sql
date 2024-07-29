ALTER TABLE `Topics` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `Topics_slug_unique` ON `Topics` (`slug`);