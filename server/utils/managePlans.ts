import { CalendarDate } from "@internationalized/date";
import fs from "fs";

export async function fetchPlan() {
  // Download the file from itslearning
  const fileDetails = await downloadPdf();
  if (!fileDetails) return;

  const { hash, date, fetchedAt, changed: pdfChanged } = fileDetails;

  const datePath = getDatePath(date);
  const basePath = `${datePath}/${hash}`;

  let usedOcr = false;

  // Get download info if it exists
  const downloadInfo = await useDrizzle().query.download.findFirst({
    where: (table, { eq }) => eq(table.hash, hash),
    columns: { hash: false },
  });

  try {
    // If necessary, convert the PDF to markdown
    if (pdfChanged || !fs.existsSync(`${basePath}/data.md`)) {
      usedOcr = await convertToMarkdown(basePath);
    }
    // If necessary, parse the plan
    if (pdfChanged || !fs.existsSync(`${basePath}/info.json`)) {
      const parsedPlan = parsePlan(`${basePath}/data.md`, date);

      // Insert plan version
      await useDrizzle()
        .insert(tables.plan)
        .values({
          ...parsedPlan,
          id: hash,
          downloadHash: hash,
          usedOcr,
        });

      // Insert all substitutions
      await useDrizzle()
        .insert(tables.substitution)
        .values(
          parsedPlan.substitutions.map((sub) => ({
            ...sub,
            planId: hash,
          }))
        );
    }
  } finally {
    // Update download info
    await useDrizzle()
      .insert(tables.download)
      .values({
        hash,
        firstFetch: fetchedAt,
        lastFetch: fetchedAt,
      })
      .onConflictDoUpdate({
        target: tables.download.hash,
        set: { lastFetch: fetchedAt },
      });
  }
}

export function getDatePath(date: CalendarDate) {
  return `server/data/plans/${date.year}/${date.month}/${date.day}`;
}

export function getPlanDiff(plan1: SubstitutionPlan, plan2: SubstitutionPlan) {
  return plan2.substitutions.filter((sub2) => {
    const sub = plan1.substitutions.find((sub) => sub.id === sub2.id);
    return JSON.stringify(sub2) !== JSON.stringify(sub);
  });
}
