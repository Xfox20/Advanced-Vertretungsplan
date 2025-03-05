import { z } from "zod";
import { parseDate } from "@internationalized/date";

export default defineEventHandler(async (event) => {
  const { date } = await getValidatedQuery(
    event,
    z.object({ date: z.string().regex(/^\d\d\d\d-\d\d-\d\d$/) }).parse
  );

  const calendarDate = parseDate(date);

  const downloadHash = await useDrizzle()
    .select()
    .from(tables.plan)
    .where(eq(tables.plan.date, calendarDate))
    .leftJoin(
      tables.download,
      eq(tables.plan.downloadHash, tables.download.hash)
    )
    .orderBy(desc(tables.download.lastFetch))
    .then((ps) => ps[0].Plan.downloadHash);

  if (!downloadHash) return createError({ statusCode: 404 });

  return hubBlob().serve(event, `plans/${downloadHash}/download.pdf`);
});
