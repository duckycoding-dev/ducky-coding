ALTER TABLE `topics` ADD `description` text;--> statement-breakpoint
ALTER TABLE `topics` ADD `background_gradient` text;--> statement-breakpoint
ALTER TABLE `topics` ADD `external_link` text;--> statement-breakpoint
ALTER TABLE `topics` ADD `post_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `topics` ADD `last_post_date` integer;--> statement-breakpoint
ALTER TABLE `topics` ADD `created_at` integer DEFAULT 1748603274931;--> statement-breakpoint
ALTER TABLE `topics` ADD `updated_at` integer DEFAULT 1748603274931;