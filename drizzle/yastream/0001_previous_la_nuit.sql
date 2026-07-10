DROP INDEX "uq_content_imdb";--> statement-breakpoint
DROP INDEX "uq_content_tmdb";--> statement-breakpoint
DROP INDEX "uq_content_tvdb";--> statement-breakpoint
DROP INDEX "idx_kv_expires_at";--> statement-breakpoint
DROP INDEX "mkvdrama_ouo_id_unique";--> statement-breakpoint
DROP INDEX "idx_provider_content_external_id";--> statement-breakpoint
DROP INDEX "idx_stream_provider_id";--> statement-breakpoint
DROP INDEX "uq_stream_url";--> statement-breakpoint
DROP INDEX "uq_stream_hash";--> statement-breakpoint
DROP INDEX "idx_subtitle_provider_id";--> statement-breakpoint
DROP INDEX "uq_subtitles_url";--> statement-breakpoint
DROP INDEX "uq_subtitles_provider_season_episode_lang";--> statement-breakpoint
ALTER TABLE `job` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-07-10T23:02:35.242Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_imdb` ON `content` (`imdb_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_tmdb` ON `content` (`tmdb_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_tvdb` ON `content` (`tvdb_id`,`type`);--> statement-breakpoint
CREATE INDEX `idx_kv_expires_at` ON `kv` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `mkvdrama_ouo_id_unique` ON `mkvdrama` (`ouo_id`);--> statement-breakpoint
CREATE INDEX `idx_provider_content_external_id` ON `provider_content` (`provider`,`external_id`);--> statement-breakpoint
CREATE INDEX `idx_stream_provider_id` ON `stream` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stream_url` ON `stream` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stream_hash` ON `stream` (`hash`);--> statement-breakpoint
CREATE INDEX `idx_subtitle_provider_id` ON `subtitle` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subtitles_url` ON `subtitle` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subtitles_provider_season_episode_lang` ON `subtitle` (`provider_content_id`,`season`,`episode`,`lang`);