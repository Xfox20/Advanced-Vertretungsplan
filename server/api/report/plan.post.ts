import { z } from "zod";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      planId: z.string(),
      type: z.enum(["missing", "many-missing", "info", "other"]),
      comment: z.string().optional(),
    }).parse
  );

  const insertionResult = await useDrizzle()
    .insert(tables.planReport)
    .values(body)
    .onConflictDoNothing();

  return insertionResult.meta.rows_written
    ? null
    : createError({ statusCode: 409, message: "Report already exists" });
});
