CREATE TABLE `PlanReport` (
	`planId` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`comment` text,
	`resolved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `SubstitutionReport` (
	`planId` text NOT NULL,
	`substitutionId` text NOT NULL,
	`type` text NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`planId`, `substitutionId`),
	FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`planId`,`substitutionId`) REFERENCES `Substitution`(`planId`,`id`) ON UPDATE no action ON DELETE no action
);
