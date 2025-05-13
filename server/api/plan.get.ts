import { parseDate } from "@internationalized/date";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { date } = await getValidatedQuery(
    event,
    z.object({ date: z.string().regex(/^\d\d\d\d-\d\d-\d\d$/) }).parse
  );

  const calendarDate = parseDate(date);

  const [dbPlan] = await useDrizzle()
    .select()
    .from(tables.download)
    .where(() => eq(tables.download.date, calendarDate))
    .leftJoin(tables.plan, () =>
      eq(tables.plan.downloadHash, tables.download.hash)
    )
    .orderBy(desc(tables.download.lastFetch))
    .limit(1);

  if (!dbPlan || !dbPlan.Plan) throw createError({ statusCode: 404 });

  const { Plan: plan, Download: downloadInfo } = dbPlan;

  const substitutions = await useDrizzle().query.substitution.findMany({
    where: (table, { eq }) => eq(table.planId, plan.id),
  });

  const subOverrides = await useDrizzle().query.substitutionOverride.findMany({
    where: (table, { eq }) => eq(table.date, calendarDate),
    orderBy: (table, { asc }) => asc(table.createdAt),
  });

  subOverrides.forEach((override) => {
    const substitution = substitutions.find(
      (s) => s.id === override.substitutionId
    );
    if (substitution) mergeSubstitutionOverrides(substitution, override.data);
  });

  const overrides = await useDrizzle().query.planOverride.findMany({
    where: (table, { eq }) => eq(table.date, calendarDate),
    orderBy: (table, { asc }) => asc(table.createdAt),
  });

  overrides.forEach((override) => {
    Object.assign(plan, override.data);
  });

  return JSON.stringify({
    ...(({ downloadHash: _, ...r }) => r)(plan),
    substitutions,
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
