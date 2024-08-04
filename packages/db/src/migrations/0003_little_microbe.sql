ALTER TABLE `Authors` RENAME TO `tmp__authors`;--> statement-breakpoint
ALTER TABLE `Images` RENAME TO `tmp__images`;--> statement-breakpoint
ALTER TABLE `PostsAuthors` RENAME TO `postsAuthors`;--> statement-breakpoint
ALTER TABLE `PostsTags` RENAME TO `postsTags`;--> statement-breakpoint
ALTER TABLE `Posts` RENAME TO `tmp__posts`;--> statement-breakpoint
ALTER TABLE `Tags` RENAME TO `tmp__tags`;--> statement-breakpoint
ALTER TABLE `Topics` RENAME TO `tmp__topics`;--> statement-breakpoint
ALTER TABLE `Users` RENAME TO `tmp__users`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/
DROP INDEX IF EXISTS `Authors_userId_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Posts_slug_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Tags_name_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Topics_title_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Topics_slug_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Users_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Users_username_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `Users_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__authors_userId_unique` ON `tmp__authors` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__posts_slug_unique` ON `tmp__posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__tags_name_unique` ON `tmp__tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__topics_title_unique` ON `tmp__topics` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__topics_slug_unique` ON `tmp__topics` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__users_id_unique` ON `tmp__users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__users_username_unique` ON `tmp__users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `tmp__users_email_unique` ON `tmp__users` (`email`);