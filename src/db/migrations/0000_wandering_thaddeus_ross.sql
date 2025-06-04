CREATE TABLE `images` (
	`path` text PRIMARY KEY NOT NULL,
	`alt` text
);
--> statement-breakpoint
CREATE TABLE `posts_tags` (
	`post_id` integer NOT NULL,
	`tag_name` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_name`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_name`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`banner_image_path` text,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`author` text DEFAULT 'DuckyCoding' NOT NULL,
	`topic_title` text NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`time_to_read` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER)) NOT NULL,
	`updated_at` integer DEFAULT (CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER)) NOT NULL,
	`published_at` integer,
	`deleted_at` integer,
	`is_featured` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`banner_image_path`) REFERENCES `images`(`path`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_title`) REFERENCES `topics`(`title`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `topics` (
	`title` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`image_path` text,
	`description` text,
	`background_gradient` text,
	`external_link` text,
	`post_count` integer DEFAULT 0 NOT NULL,
	`last_post_date` integer,
	`created_at` integer DEFAULT (CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER)) NOT NULL,
	`updated_at` integer DEFAULT (CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER)) NOT NULL,
	FOREIGN KEY (`title`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_path`) REFERENCES `images`(`path`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_title_unique` ON `topics` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);