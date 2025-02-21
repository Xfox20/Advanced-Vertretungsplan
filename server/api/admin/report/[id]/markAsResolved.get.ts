import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { id: reportId } = await getValidatedRouterParams(
    event,
    z.object({ id: z.string() }).parse
  );

  await useDrizzle()
    .update(tables.report)
    .set({ resolved: true })
    .where(eq(tables.report.id, reportId));
});
