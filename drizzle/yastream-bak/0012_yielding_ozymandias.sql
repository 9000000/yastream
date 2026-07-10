PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_job` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer DEFAULT '"2026-06-13T10:39:30.787Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_job`("id", "status", "type", "data", "created_at") SELECT "id", "status", "type", "data", "created_at" FROM `job`;--> statement-breakpoint
DROP TABLE `job`;--> statement-breakpoint
ALTER TABLE `__new_job` RENAME TO `job`;--> statement-breakpoint
PRAGMA foreign_keys=ON;