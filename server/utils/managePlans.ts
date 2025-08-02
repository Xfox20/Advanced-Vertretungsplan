export function getPlanDiff(plan1: SubstitutionPlan, plan2: SubstitutionPlan) {
  return plan2.substitutions.filter((sub2) => {
    const sub = plan1.substitutions.find((sub) => sub.id === sub2.id);
    return JSON.stringify(sub2) !== JSON.stringify(sub);
  });
}
