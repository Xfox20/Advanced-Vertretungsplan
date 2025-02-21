import { parseDate, now, toCalendarDateTime } from "@internationalized/date";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      date: z
        .string()
        .regex(/^\d\d\d\d-\d\d-\d\d$/)
        .transform((value) => parseDate(value)),
      data: z.object({
        notes: z.array(z.string()).optional(),
      }),
    }).parse
  );

  await useDrizzle()
    .insert(tables.planOverride)
    .values({
      ...body,
      createdAt: toCalendarDateTime(now("Europe/Berlin")),
    });
});
