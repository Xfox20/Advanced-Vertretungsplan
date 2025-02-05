import fs from "fs";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { date } = await getValidatedQuery(
    event,
    z.object({ date: z.coerce.date() }).parse
  );

  const basePath = getDatePath(date);

  try {
    const manifestPath = fs.realpathSync(`${basePath}/manifest.json`);

    const manifest: DownloadManifest = JSON.parse(
      fs.readFileSync(manifestPath).toString()
    );

    const path = fs.realpathSync(`${basePath}/${manifest.current}/info.json`);

    const json: SubstitutionPlan = JSON.parse(fs.readFileSync(path).toString());
    Object.assign(json, {
      lastFetched: manifest.versions[manifest.current].lastChecked,
      faulty: manifest.versions[manifest.current].usedOcr,
    });

    return json as DetailedSubstitutionPlan;
  } catch {
    return createError({ statusCode: 404 });
  }
});
