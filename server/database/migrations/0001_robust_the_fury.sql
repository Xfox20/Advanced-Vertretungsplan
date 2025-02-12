CREATE TABLE `Download` (
	`hash` text PRIMARY KEY NOT NULL,
	`firstFetch` calendarDateTime NOT NULL,
	`lastFetch` calendarDateTime NOT NULL
);
--> statement-breakpoint
INSERT INTO `Download`("hash", "firstFetch", "lastFetch")  
SELECT "downloadHash", "firstFetch", "lastFetch" FROM `Plan`;
--> statement-breakpoint
ALTER TABLE `Plan` DROP COLUMN `firstFetch`;--> statement-breakpoint
ALTER TABLE `Plan` DROP COLUMN `lastFetch`;