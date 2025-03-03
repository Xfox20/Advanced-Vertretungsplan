CREATE TABLE `Report` (
	`id` text PRIMARY KEY NOT NULL,
	`planId` text NOT NULL,
	`substitutionId` text,
	`type` text NOT NULL,
	`comment` text,
	`resolved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`planId`,`substitutionId`) REFERENCES `Substitution`(`planId`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `PlanReport`;--> statement-breakpoint
DROP TABLE `SubstitutionReport`;