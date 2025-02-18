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

  const overrides = await useDrizzle().query.substitutionOverride.findMany({
    where: (table, { eq }) => eq(table.date, calendarDate),
    orderBy: (table, { asc }) => asc(table.createdAt),
  });

  overrides.forEach((override) => {
    const substitution = dbPlan.substitutions.find(
      (s) => s.id === override.substitutionId
    );
    if (substitution) mergeSubstitutionOverrides(substitution, override.data);
  });

  return JSON.stringify({
    ...(({ downloadHash: _, ...r }) => r)(dbPlan),
    firstFetch: downloadInfo.firstFetch,
    lastFetch: downloadInfo.lastFetch,
  });
});

function mergeSubstitutionOverrides(
  substitution: Substitution,
  override: Partial<Substitution>
) {
  if (substitution.substitution) {
    Object.assign(substitution.substitution, override.substitution);
  }
  Object.assign(substitution, {
    ...override,
    substitution: substitution.substitution,
  });
}
