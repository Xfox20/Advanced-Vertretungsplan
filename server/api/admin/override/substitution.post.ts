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
      substitutionId: z.string(),
      data: z.object({
        classes: z.array(z.string()).optional(),
        hours: z.array(z.number()).optional(),
        teacher: z.string().optional(),
        subject: z.string().optional(),
        room: z.string().optional(),
        substitution: z
          .object({
            teacher: z.string().optional(),
            subject: z.string().optional(),
            room: z.string().optional(),
          })
          .optional(),
        note: z.string().optional(),
      }),
    }).parse
  );

  await useDrizzle()
    .insert(tables.substitutionOverride)
    .values({
      ...body,
      createdAt: toCalendarDateTime(now("Europe/Berlin")),
    });
});
