CREATE TABLE `Authors` (
	`userId` text PRIMARY KEY NOT NULL,
	`bio` text,
	FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`alt` text,
	`context` text NOT NULL,
	`path` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PostsAuthors` (
	`postId` integer NOT NULL,
	`authorId` integer NOT NULL,
	PRIMARY KEY(`authorId`, `postId`),
	FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorId`) REFERENCES `Authors`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `PostsTags` (
	`postId` integer NOT NULL,
	`tagName` integer NOT NULL,
	PRIMARY KEY(`postId`, `tagName`),
	FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tagName`) REFERENCES `Tags`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`topicTitle` integer,
	`bannerImageId` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer,
	`deletedAt` integer,
	FOREIGN KEY (`topicTitle`) REFERENCES `Topics`(`title`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bannerImageId`) REFERENCES `Images`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`lastName` text
);
--> statement-breakpoint
ALTER TABLE `Topics` ADD `imageId` integer REFERENCES Images(id);--> statement-breakpoint
CREATE UNIQUE INDEX `Authors_userId_unique` ON `Authors` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Posts_slug_unique` ON `Posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_id_unique` ON `Users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_username_unique` ON `Users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `Users_email_unique` ON `Users` (`email`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/
ALTER TABLE `Topics` DROP COLUMN `imageFilename`;--> statement-breakpoint
ALTER TABLE `Topics` DROP COLUMN `imageAlt`;