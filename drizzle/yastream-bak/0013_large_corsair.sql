ALTER TABLE `streams` RENAME TO `stream`;--> statement-breakpoint
ALTER TABLE `subtitles` RENAME TO `subtitle`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_stream` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_content_id` text NOT NULL,
	`provider` text NOT NULL,
	`external_id` text,
	`season` text NOT NULL,
	`episode` text NOT NULL,
	`url` text NOT NULL,
	`playlist` text,
	`hash` text,
	`resolution` text,
	`size` text,
	`duration` text,
	`created_at` integer NOT NULL,
	`ttl` integer,
	FOREIGN KEY (`provider_content_id`) REFERENCES `provider_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_stream`("id", "provider_content_id", "provider", "external_id", "season", "episode", "url", "playlist", "hash", "resolution", "size", "duration", "created_at", "ttl") SELECT "id", "provider_content_id", "provider", "external_id", "season", "episode", "url", "playlist", "hash", "resolution", "size", "duration", "created_at", "ttl" FROM `stream`;--> statement-breakpoint
DROP TABLE `stream`;--> statement-breakpoint
ALTER TABLE `__new_stream` RENAME TO `stream`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_streams_provider_id` ON `stream` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_streams_url` ON `stream` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_streams_hash` ON `stream` (`hash`);--> statement-breakpoint
CREATE TABLE `__new_subtitle` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_content_id` text NOT NULL,
	`season` text,
	`episode` text,
	`url` text NOT NULL,
	`lang` text NOT NULL,
	`subtitle` text,
	`created_at` integer NOT NULL,
	`ttl` integer,
	FOREIGN KEY (`provider_content_id`) REFERENCES `provider_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subtitle`("id", "provider_content_id", "season", "episode", "url", "lang", "subtitle", "created_at", "ttl") SELECT "id", "provider_content_id", "season", "episode", "url", "lang", "subtitle", "created_at", "ttl" FROM `subtitle`;--> statement-breakpoint
DROP TABLE `subtitle`;--> statement-breakpoint
ALTER TABLE `__new_subtitle` RENAME TO `subtitle`;--> statement-breakpoint
CREATE INDEX `idx_subtitles_provider_id` ON `subtitle` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subtitles_url` ON `subtitle` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subtitles_provider_season_episode_lang` ON `subtitle` (`provider_content_id`,`season`,`episode`,`lang`);--> statement-breakpoint
DROP INDEX "uq_content_imdb";--> statement-breakpoint
DROP INDEX "uq_content_tmdb";--> statement-breakpoint
DROP INDEX "uq_content_tvdb";--> statement-breakpoint
DROP INDEX "idx_kv_expires_at";--> statement-breakpoint
DROP INDEX "mkvdrama_ouo_id_unique";--> statement-breakpoint
DROP INDEX "idx_provider_content_external_id";--> statement-breakpoint
DROP INDEX "idx_streams_provider_id";--> statement-breakpoint
DROP INDEX "uq_streams_url";--> statement-breakpoint
DROP INDEX "uq_streams_hash";--> statement-breakpoint
DROP INDEX "idx_subtitles_provider_id";--> statement-breakpoint
DROP INDEX "uq_subtitles_url";--> statement-breakpoint
DROP INDEX "uq_subtitles_provider_season_episode_lang";--> statement-breakpoint
ALTER TABLE `job` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-06-13T12:23:42.411Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_imdb` ON `content` (`imdb_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_tmdb` ON `content` (`tmdb_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_tvdb` ON `content` (`tvdb_id`,`type`);--> statement-breakpoint
CREATE INDEX `idx_kv_expires_at` ON `kv` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `mkvdrama_ouo_id_unique` ON `mkvdrama` (`ouo_id`);--> statement-breakpoint
CREATE INDEX `idx_provider_content_external_id` ON `provider_content` (`provider`,`external_id`);