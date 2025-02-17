import { z } from "zod";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      planId: z.string(),
      substitutionId: z.string(),
      type: z.enum(["wrong", "missing", "scrambled"]),
    }).parse
  );

  const insertionResult = await useDrizzle()
    .insert(tables.substitutionReport)
    .values(body)
    .onConflictDoNothing();

  return insertionResult.meta.rows_written
    ? null
    : createError({ statusCode: 409, message: "Report already exists" });
});
