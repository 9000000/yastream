CREATE TABLE `content` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`alt_title` text,
	`overview` text,
	`year` integer NOT NULL,
	`type` text NOT NULL,
	`imdb_id` text,
	`tmdb_id` text,
	`tvdb_id` text,
	`poster` text,
	`background` text,
	`logo` text,
	`genres` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`ttl` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_imdb` ON `content` (`imdb_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_tmdb` ON `content` (`tmdb_id`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_content_tvdb` ON `content` (`tvdb_id`,`type`);--> statement-breakpoint
CREATE TABLE `job` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer DEFAULT '"2026-06-16T15:49:16.836Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kv` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`size` integer,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_kv_expires_at` ON `kv` (`expires_at`);--> statement-breakpoint
CREATE TABLE `mkvdrama` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_content_id` text NOT NULL,
	`ouo_id` text,
	`quality` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`ttl` integer,
	FOREIGN KEY (`provider_content_id`) REFERENCES `provider_content`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ouo_id`) REFERENCES `ouo`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mkvdrama_ouo_id_unique` ON `mkvdrama` (`ouo_id`);--> statement-breakpoint
CREATE TABLE `ouo` (
	`id` text PRIMARY KEY NOT NULL,
	`original_url` text NOT NULL,
	`redirected_url` text,
	`password` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `provider_content` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`title` text NOT NULL,
	`year` integer NOT NULL,
	`type` text NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`ttl` integer,
	FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_provider_content_external_id` ON `provider_content` (`provider`,`external_id`);--> statement-breakpoint
CREATE TABLE `stream` (
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
CREATE INDEX `idx_stream_provider_id` ON `stream` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stream_url` ON `stream` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stream_hash` ON `stream` (`hash`);--> statement-breakpoint
CREATE TABLE `subtitle` (
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
CREATE INDEX `idx_subtitle_provider_id` ON `subtitle` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subtitles_url` ON `subtitle` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subtitles_provider_season_episode_lang` ON `subtitle` (`provider_content_id`,`season`,`episode`,`lang`);