DROP INDEX IF EXISTS `posts_slug_unique`;--> statement-breakpoint
ALTER TABLE `posts` ADD `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `summary` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `content` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `language` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `timeToRead` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `stat` text DEFAULT 'draft' NOT NULL;