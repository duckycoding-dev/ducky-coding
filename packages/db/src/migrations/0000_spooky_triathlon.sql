CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`alt` text
);
--> statement-breakpoint
CREATE TABLE `postsAuthors` (
	`postId` integer NOT NULL,
	`authorId` integer NOT NULL,
	PRIMARY KEY(`authorId`, `postId`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `postsTags` (
	`postId` integer NOT NULL,
	`tagName` text NOT NULL,
	PRIMARY KEY(`postId`, `tagName`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tagName`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`bannerImageId` integer,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`topicTitle` text NOT NULL,
	`language` text NOT NULL,
	`timeToRead` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`publishedAt` integer,
	`deletedAt` integer,
	FOREIGN KEY (`bannerImageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topicTitle`) REFERENCES `topics`(`title`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`title` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`imageId` integer,
	FOREIGN KEY (`title`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`lastName` text,
	`profilePictureId` integer,
	`bio` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deletedAt` integer,
	FOREIGN KEY (`profilePictureId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_path_unique` ON `images` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_title_unique` ON `topics` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);