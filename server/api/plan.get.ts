import { parseDate } from "@internationalized/date";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { date } = await getValidatedQuery(
    event,
    z.object({ date: z.string().regex(/^\d\d\d\d-\d\d-\d\d$/) }).parse
  );

  const calendarDate = parseDate(date);

  const dbPlan = await useDrizzle().query.plan.findFirst({
    where: (table, { eq }) => eq(table.date, calendarDate),
    with: { substitutions: { columns: { planId: false } } },
  });
  if (!dbPlan) return createError({ statusCode: 404 });

  const downloadInfo = await useDrizzle().query.download.findFirst({
    where: (table, { eq }) => eq(table.hash, dbPlan.downloadHash),
  });
  if (!downloadInfo) return createError({ statusCode: 500 });

  return JSON.stringify({
    ...(({ downloadHash: _, ...r }) => r)(dbPlan),
    firstFetch: downloadInfo.firstFetch,
    lastFetch: downloadInfo.lastFetch,
  });
});
