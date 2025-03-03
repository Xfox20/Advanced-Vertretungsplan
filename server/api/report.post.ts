import { z } from "zod";
import { nanoid } from "nanoid";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.union([
      z.object({
        planId: z.string(),
        substitutionId: z.string(),
        type: z.enum(["wrong", "missing", "scrambled"]),
      }),
      z.object({
        planId: z.string(),
        type: z.enum(["missing", "many-missing", "info", "other"]),
        comment: z.string().optional(),
      }),
    ]).parse
  );

  const existingReport = await useDrizzle().query.report.findFirst({
    where: (table, { eq, and, isNull }) =>
      and(
        eq(table.planId, body.planId),
        "substitutionId" in body
          ? eq(table.substitutionId, body.substitutionId)
          : isNull(table.substitutionId),
        eq(table.type, body.type)
      ),
  });

  if (existingReport) {
    return createError({ statusCode: 409, message: "Report already exists" });
  } else {
    await useDrizzle()
      .insert(tables.report)
      .values({ id: nanoid(), ...body });
  }
});
