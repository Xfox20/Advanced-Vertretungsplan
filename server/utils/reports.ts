import fs from "fs";

export function resolveReportDocument(planId: string): PlanReportDocument {
  const planDate = getDateFromPlanHash(planId);
  const path = getDatePath(planDate);
  const reportFilePath = `${path}/${planId}/reports.json`;

  try {
    return JSON.parse(fs.readFileSync(reportFilePath, "utf-8"));
  } catch {
    return {
      planReports: [],
      substitutionReports: {},
    };
  }
}

export function writeReportDocument(
  planId: string,
  document: PlanReportDocument
) {
  const planDate = getDateFromPlanHash(planId);
  const path = getDatePath(planDate);
  const reportFilePath = `${path}/${planId}/reports.json`;

  fs.writeFileSync(reportFilePath, JSON.stringify(document));
}
