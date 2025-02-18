export default defineEventHandler(async (event) => {
  await authenticate(event);

  return {
    plan: await useDrizzle()
      .query.planReport.findMany({
        where: eq(tables.planReport.resolved, false),
        with: { plan: true },
      })
      .then((plans) => plans.concat()),
    substitution: await useDrizzle().query.substitutionReport.findMany({
      where: eq(tables.substitutionReport.resolved, false),
      with: { plan: true, substitution: true },
    }),
  };
});
