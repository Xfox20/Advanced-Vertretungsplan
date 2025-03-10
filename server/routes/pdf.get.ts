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
    .from(tables.download)
    .where(eq(tables.download.date, calendarDate))
    .orderBy(desc(tables.download.lastFetch))
    .then((ps) => ps[0]?.hash);

  if (!downloadHash) return createError({ statusCode: 404 });

  return hubBlob().serve(event, `plans/${downloadHash}/download.pdf`);
});
