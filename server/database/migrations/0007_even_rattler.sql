PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Plan` (
	`id` text PRIMARY KEY NOT NULL,
	`downloadHash` text NOT NULL,
	`date` calendarDate NOT NULL,
	`updatedAt` calendarDateTime,
	`notes` text NOT NULL,
	`faulty` integer DEFAULT false
);
--> statement-breakpoint
INSERT INTO `__new_Plan`("id", "downloadHash", "date", "updatedAt", "notes", "faulty") SELECT "id", "downloadHash", "date", "updatedAt", "notes", "faulty" FROM `Plan`;--> statement-breakpoint
DROP TABLE `Plan`;--> statement-breakpoint
ALTER TABLE `__new_Plan` RENAME TO `Plan`;--> statement-breakpoint
PRAGMA foreign_keys=ON;