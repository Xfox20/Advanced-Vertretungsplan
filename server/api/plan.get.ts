import { parseDate } from "@internationalized/date";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { date } = await getValidatedQuery(
    event,
    z.object({ date: z.string().regex(/^\d\d\d\d-\d\d-\d\d$/) }).parse
  );

  const calendarDate = parseDate(date);

  const plan: SubstitutionPlan | undefined =
    await useDrizzle().query.plan.findFirst({
      where: (table, { eq }) => eq(table.date, calendarDate),
      columns: { downloadHash: false },
      with: { substitutions: { columns: { planId: false } } },
    });

  return plan ?? createError({ statusCode: 404 });
});
