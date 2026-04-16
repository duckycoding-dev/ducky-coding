CREATE TABLE `memes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`author` text DEFAULT 'DuckyCoding' NOT NULL,
	`image_path` text NOT NULL,
	`image_alt` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (CAST(ROUND((julianday('now') - 2440587.5) * 86400000) AS INTEGER)) NOT NULL,
	FOREIGN KEY (`image_path`) REFERENCES `images`(`path`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memes_slug_unique` ON `memes` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts_tags` (
	`post_id` integer NOT NULL,
	`tag_name` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_name`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_name`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_posts_tags`("post_id", "tag_name") SELECT "post_id", "tag_name" FROM `posts_tags`;--> statement-breakpoint
DROP TABLE `posts_tags`;--> statement-breakpoint
ALTER TABLE `__new_posts_tags` RENAME TO `posts_tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;