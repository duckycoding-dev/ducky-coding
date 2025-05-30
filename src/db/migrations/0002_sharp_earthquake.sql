DROP INDEX "tags_name_unique";--> statement-breakpoint
DROP INDEX "topics_title_unique";--> statement-breakpoint
DROP INDEX "topics_slug_unique";--> statement-breakpoint
ALTER TABLE `topics` ALTER COLUMN "created_at" TO "created_at" integer DEFAULT 1748631173585;--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_title_unique` ON `topics` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
ALTER TABLE `topics` ALTER COLUMN "updated_at" TO "updated_at" integer DEFAULT 1748631173585;--> statement-breakpoint
ALTER TABLE `posts` ADD `is_featured` integer DEFAULT false NOT NULL;