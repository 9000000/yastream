CREATE TABLE `supporter` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_customer_id` text,
	`provider_subscription_id` text,
	`tier_name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`email` text,
	`created_at` integer DEFAULT '"2026-06-16T13:58:00.976Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-06-16T13:58:00.976Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `supporter_provider_subscription_id_unique` ON `supporter` (`provider_subscription_id`);