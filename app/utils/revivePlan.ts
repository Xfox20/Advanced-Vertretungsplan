import { parseDate, parseDateTime } from "@internationalized/date";

export default (plan: DeadSubstitutionPlan) => {
  const newPlan = plan as SubstitutionPlan | DeadSubstitutionPlan;
  newPlan.date = parseDate(plan.date);
  newPlan.updatedAt = parseDateTime(plan.updatedAt);
  newPlan.firstFetch = parseDateTime(plan.firstFetch);
  newPlan.lastFetch = parseDateTime(plan.lastFetch);
  return newPlan as SubstitutionPlan;
};
