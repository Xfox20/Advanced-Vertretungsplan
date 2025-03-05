ALTER TABLE `Download` ADD `date` calendarDate;
--> statement-breakpoint
UPDATE Download SET date = (SELECT Plan.date FROM Plan WHERE Plan.downloadHash = Download.hash);