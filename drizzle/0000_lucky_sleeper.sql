CREATE TABLE `admins` (
	`email` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `upload_parts` (
	`id` text PRIMARY KEY NOT NULL,
	`upload` text NOT NULL,
	`number` integer NOT NULL,
	`etag` text NOT NULL,
	`size` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `releases` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`key` text NOT NULL,
	`size` integer NOT NULL,
	`notes` text NOT NULL,
	`minimum` text NOT NULL,
	`created` text NOT NULL,
	`active` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`key` text NOT NULL,
	`multipart` text NOT NULL,
	`version` text NOT NULL,
	`size` integer NOT NULL,
	`notes` text NOT NULL,
	`minimum` text NOT NULL,
	`created` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL
);
