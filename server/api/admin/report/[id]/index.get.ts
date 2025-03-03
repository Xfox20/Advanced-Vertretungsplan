import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { id: reportId } = await getValidatedRouterParams(
    event,
    z.object({ id: z.string() }).parse
  );

  return useDrizzle().query.report.findFirst({
    where: (table, { eq }) => eq(table.id, reportId),
    with: { plan: true, substitution: true },
  });
});
