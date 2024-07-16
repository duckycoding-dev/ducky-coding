CREATE TABLE `Tags` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Topics` (
	`title` text PRIMARY KEY NOT NULL,
	`imageFilename` text,
	`imageAlt` text,
	FOREIGN KEY (`title`) REFERENCES `Tags`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Tags_name_unique` ON `Tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `Topics_title_unique` ON `Topics` (`title`);