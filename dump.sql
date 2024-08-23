PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		);
INSERT INTO __drizzle_migrations VALUES(NULL,'16eb42e71eaa7e053aab84603f93be8ad05ce862ffbf21dc22a62a83fd12963e',1724257405067);
CREATE TABLE IF NOT EXISTS `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`alt` text
);
INSERT INTO images VALUES(1,'topics/astro-icon-light-gradient.png','Logo of AstroJS');
INSERT INTO images VALUES(2,'topics/css3-logo.png','Logo of the third version of CSS');
INSERT INTO images VALUES(3,'topics/typescript-logo.png','Logo of TypeScript');
INSERT INTO images VALUES(4,'topics/react-logo.png','Logo of ReactJS');
INSERT INTO images VALUES(5,'posts/test-banner.png','Test image for a post');
INSERT INTO images VALUES(6,'default_profile_icon.png','Default profile icon for every new user');
INSERT INTO images VALUES(7,'DuckyCoding_logo.png','Official logo of DuckyCoding');
CREATE TABLE IF NOT EXISTS `postsAuthors` (
	`postId` integer NOT NULL,
	`authorId` integer NOT NULL,
	PRIMARY KEY(`authorId`, `postId`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO postsAuthors VALUES(1,1);
CREATE TABLE IF NOT EXISTS `postsTags` (
	`postId` integer NOT NULL,
	`tagName` text NOT NULL,
	PRIMARY KEY(`postId`, `tagName`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tagName`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action
);
INSERT INTO postsTags VALUES(1,'CSS');
INSERT INTO postsTags VALUES(1,'Astro');
CREATE TABLE IF NOT EXISTS `posts` (
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
INSERT INTO posts VALUES(1,'post-1','post1 title',5,'summary post1','content title post1','Astro','en',3,'published',1723499812,1724366237,1723499812,NULL);
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`refreshToken` text NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS `tags` (
	`name` text PRIMARY KEY NOT NULL
);
INSERT INTO tags VALUES('Astro');
INSERT INTO tags VALUES('CSS');
INSERT INTO tags VALUES('TypeScript');
INSERT INTO tags VALUES('React');
CREATE TABLE IF NOT EXISTS `topics` (
	`title` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`imageId` integer,
	FOREIGN KEY (`title`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO topics VALUES('React','react',4);
INSERT INTO topics VALUES('Astro','astro',1);
INSERT INTO topics VALUES('TypeScript','typescript',3);
INSERT INTO topics VALUES('CSS','css',2);
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`lastName` text,
	`profilePictureId` integer,
	`bio` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deletedAt` integer,
	FOREIGN KEY (`profilePictureId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO users VALUES(1,'DuckyCoding','duckycoding.dev@gmail.com','ciaociao','Davide','Milan',7,'Hello everyone! I''m Ducky, creator of this blog! 🦆',1723459273,1723459273,NULL);
INSERT INTO users VALUES(2,'mapledade','mapledade17@gmail.com','ciaociao','Davide',NULL,1,NULL,1723620740,1723620740,NULL);
INSERT INTO users VALUES(3,'davide','davidemilan27gmail.com','ciaociao','Davide','Milan',1,NULL,1724331534,1724331534,NULL);
INSERT INTO users VALUES(4,'davidemilan62','davidemilan62@gmail.com','ciaociao','Davide',NULL,1,NULL,1724396927,1724396927,NULL);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('images',7);
INSERT INTO sqlite_sequence VALUES('users',4);
INSERT INTO sqlite_sequence VALUES('images',5);
INSERT INTO sqlite_sequence VALUES('users',4);
INSERT INTO sqlite_sequence VALUES('images',5);
INSERT INTO sqlite_sequence VALUES('users',1);
INSERT INTO sqlite_sequence VALUES('posts',1);
CREATE UNIQUE INDEX `images_path_unique` ON `images` (`path`);
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);
CREATE UNIQUE INDEX `topics_title_unique` ON `topics` (`title`);
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
COMMIT;
