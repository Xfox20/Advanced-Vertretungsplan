import {
  customType,
  primaryKey,
  foreignKey,
  uniqueIndex,
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import {
  CalendarDate,
  CalendarDateTime,
  parseDate,
  parseDateTime,
} from "@internationalized/date";
import { relations } from "drizzle-orm";

// Custom Types
const calendarDate = customType<{ data: CalendarDate }>({
  dataType: () => "calendarDate",
  toDriver: (value) => value.toString(),
  fromDriver: (value: any) => new PortableCalendarDate(parseDate(value)),
});
const calendarDateTime = customType<{ data: CalendarDateTime }>({
  dataType: () => "calendarDateTime",
  toDriver: (value) => value.toString(),
  fromDriver: (value: any) =>
    new PortableCalendarDateTime(parseDateTime(value)),
});

export const download = sqliteTable("Download", {
  hash: text().notNull().primaryKey(),
  firstFetch: calendarDateTime().notNull(),
  lastFetch: calendarDateTime().notNull(),
});

export const downloadRelations = relations(download, ({ one }) => ({
  plan: one(plan),
}));

export const plan = sqliteTable("Plan", {
  id: text().primaryKey(),
  downloadHash: text().notNull(),
  date: calendarDate().notNull(),
  updatedAt: calendarDateTime().notNull(),
  notes: text({ mode: "json" }).$type<string[]>().notNull(),
  usedOcr: integer({ mode: "boolean" }),
});

export const planVersionRelations = relations(plan, ({ one, many }) => ({
  download: one(download, {
    fields: [plan.downloadHash],
    references: [download.hash],
  }),
  substitutions: many(substitution),
}));

export const substitution = sqliteTable(
  "Substitution",
  {
    id: text().notNull(),
    planId: text().notNull(),
    classes: text({ mode: "json" }).$type<string[]>().notNull(),
    hours: text({ mode: "json" }).$type<number[]>().notNull(),
    teacher: text(),
    subject: text({ mode: "json" }).$type<Substitution["subject"]>().notNull(),
    room: text(),
    substitution: text({ mode: "json" }).$type<Substitution["substitution"]>(),
    note: text(),
  },
  (table) => [primaryKey({ columns: [table.id, table.planId] })]
);

export const substitutionRelations = relations(substitution, ({ one }) => ({
  plan: one(plan, {
    fields: [substitution.planId],
    references: [plan.downloadHash],
  }),
}));

export const planReport = sqliteTable("PlanReport", {
  planId: text()
    .primaryKey()
    .references(() => plan.id),
  type: text({
    enum: ["missing", "many-missing", "info", "other"],
  }).notNull(),
  comment: text(),
  resolved: integer({ mode: "boolean" }).notNull().default(false),
});

export const substitutionReport = sqliteTable(
  "SubstitutionReport",
  {
    planId: text()
      .notNull()
      .references(() => plan.id),
    substitutionId: text().notNull(),
    type: text({
      enum: ["missing", "wrong", "scrambled"],
    }).notNull(),
    resolved: integer({ mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.planId, table.substitutionId] }),
    foreignKey({
      columns: [table.planId, table.substitutionId],
      foreignColumns: [substitution.planId, substitution.id],
    }),
  ]
);
