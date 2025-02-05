import fs from "fs";

export async function fetchPlan() {
  // Download the file from itslearning
  const fileDetails = await downloadPdf();
  if (!fileDetails) return;

  const { hash, date, fetchedAt, changed: pdfChanged } = fileDetails;

  const datePath = getDatePath(date);
  const basePath = `${datePath}/${hash}`;

  // Load manifest
  const manifestPath = `${datePath}/manifest.json`;
  const manifest: DownloadManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
    : { current: "", versions: {} };

  // Update manifest
  manifest.versions[hash] = {
    fetchedAt: manifest.versions[hash]?.fetchedAt || fetchedAt,
    lastChecked: fetchedAt,
    usedOcr: manifest.versions[hash]?.usedOcr,
  };

  try {
    // If necessary, convert the PDF to markdown
    if (pdfChanged || !fs.existsSync(`${basePath}/data.md`)) {
      manifest.versions[hash].usedOcr = await convertToMarkdown(basePath);
    }
    // If necessary, parse the plan
    if (pdfChanged || !fs.existsSync(`${basePath}/info.json`)) {
      const planJson = await parsePlan(`${basePath}/data.md`, date);
      fs.writeFileSync(`${basePath}/info.json`, JSON.stringify(planJson));
    }

    // If everything succeeds, update the current version
    manifest.current = hash;
  } finally {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  }
}

export function getDatePath(date: Date) {
  return `server/data/plans/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}`;
}

export function getPlanDiff(plan1: SubstitutionPlan, plan2: SubstitutionPlan) {
  return plan2.substitutions.filter((sub2) => {
    const sub = plan1.substitutions.find((sub) => sub.id === sub2.id);
    return JSON.stringify(sub2) !== JSON.stringify(sub);
  });
}
