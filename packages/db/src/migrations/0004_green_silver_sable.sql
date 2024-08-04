ALTER TABLE `tmp__authors` RENAME TO `authors`;--> statement-breakpoint
ALTER TABLE `tmp__images` RENAME TO `images`;--> statement-breakpoint
ALTER TABLE `tmp__postsAuthors` RENAME TO `postsAuthors`;--> statement-breakpoint
ALTER TABLE `tmp__postsTags` RENAME TO `postsTags`;--> statement-breakpoint
ALTER TABLE `tmp__posts` RENAME TO `posts`;--> statement-breakpoint
ALTER TABLE `tmp__tags` RENAME TO `tags`;--> statement-breakpoint
ALTER TABLE `tmp__topics` RENAME TO `topics`;--> statement-breakpoint
ALTER TABLE `tmp__users` RENAME TO `users`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/
DROP INDEX IF EXISTS `tmp__authors_userId_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__posts_slug_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__tags_name_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__topics_title_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__topics_slug_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__users_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__users_username_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `tmp__users_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `authors_userId_unique` ON `authors` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_title_unique` ON `topics` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/