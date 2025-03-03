export async function fetchPlan() {
  // Download the file from itslearning
  const fileDetails = await downloadPdf();
  if (!fileDetails) return;

  const { hash: downloadHash, date, changed: pdfChanged } = fileDetails;

  // If necessary, convert the PDF to markdown and parse it
  if (pdfChanged) {
    try {
      await convertToMarkdown(downloadHash);
    } catch (e) {
      console.warn(e);
    }
    await parsePlan(downloadHash, date);
  }
}

export function getPlanDiff(plan1: SubstitutionPlan, plan2: SubstitutionPlan) {
  return plan2.substitutions.filter((sub2) => {
    const sub = plan1.substitutions.find((sub) => sub.id === sub2.id);
    return JSON.stringify(sub2) !== JSON.stringify(sub);
  });
}
