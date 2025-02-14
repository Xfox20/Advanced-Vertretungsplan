CREATE TABLE `Plan` (
	`id` text PRIMARY KEY NOT NULL,
	`downloadHash` text NOT NULL,
	`date` calendarDate NOT NULL,
	`updatedAt` calendarDateTime NOT NULL,
	`notes` text NOT NULL,
	`firstFetch` calendarDateTime NOT NULL,
	`lastFetch` calendarDateTime NOT NULL,
	`usedOcr` integer
);
--> statement-breakpoint
CREATE TABLE `Substitution` (
	`id` text NOT NULL,
	`planId` text NOT NULL,
	`classes` text NOT NULL,
	`hours` text NOT NULL,
	`teacher` text,
	`subject` text NOT NULL,
	`room` text,
	`substitution` text,
	`note` text,
	PRIMARY KEY(`id`, `planId`)
);
