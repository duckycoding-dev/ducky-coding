ALTER TABLE `postsAuthors` RENAME TO `posts_authors`;--> statement-breakpoint
ALTER TABLE `postsTags` RENAME TO `posts_tags`;--> statement-breakpoint
ALTER TABLE `posts_authors` RENAME COLUMN "postId" TO "post_id";--> statement-breakpoint
ALTER TABLE `posts_authors` RENAME COLUMN "authorId" TO "author_id";--> statement-breakpoint
ALTER TABLE `posts_tags` RENAME COLUMN "postId" TO "post_id";--> statement-breakpoint
ALTER TABLE `posts_tags` RENAME COLUMN "tagName" TO "tag_name";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "bannerImageId" TO "banner_image_id";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "topicTitle" TO "topic_title";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "timeToRead" TO "time_to_read";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "publishedAt" TO "published_at";--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE `sessions` RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE `sessions` RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
ALTER TABLE `sessions` RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE `topics` RENAME COLUMN "imageId" TO "image_id";--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN "lastName" TO "last_name";--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN "profilePictureId" TO "profile_picture_id";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts_authors` (
	`post_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	PRIMARY KEY(`post_id`, `author_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_posts_authors`("post_id", "author_id") SELECT "post_id", "author_id" FROM `posts_authors`;--> statement-breakpoint
DROP TABLE `posts_authors`;--> statement-breakpoint
ALTER TABLE `__new_posts_authors` RENAME TO `posts_authors`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_posts_tags` (
	`post_id` integer NOT NULL,
	`tag_name` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_name`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_name`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_posts_tags`("post_id", "tag_name") SELECT "post_id", "tag_name" FROM `posts_tags`;--> statement-breakpoint
DROP TABLE `posts_tags`;--> statement-breakpoint
ALTER TABLE `__new_posts_tags` RENAME TO `posts_tags`;--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "banner_image_id" TO "banner_image_id" integer REFERENCES images(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "topic_title" TO "topic_title" text NOT NULL REFERENCES topics(title) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "user_id" TO "user_id" integer NOT NULL REFERENCES users(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `topics` ALTER COLUMN "image_id" TO "image_id" integer REFERENCES images(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "profile_picture_id" TO "profile_picture_id" integer REFERENCES images(id) ON DELETE no action ON UPDATE no action;