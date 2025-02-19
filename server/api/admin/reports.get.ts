export default defineEventHandler(async (event) => {
  await authenticate(event);

  return await useDrizzle().query.report.findMany({
    where: (table, { eq }) => eq(table.resolved, false),
    with: { plan: true, substitution: true },
  });
});
