import { z } from "zod";
import fs from "fs";

export default defineEventHandler(async (event) => {
  const { date } = await getValidatedQuery(
    event,
    z.object({ date: z.coerce.date() }).parse
  );

  const basePath = `server/data/plans/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}`;

  try {
    const manifestPath = fs.realpathSync(`${basePath}/manifest.json`);

    const manifest: DownloadManifest = JSON.parse(
      fs.readFileSync(manifestPath).toString()
    );

    const path = fs.realpathSync(
      `${basePath}/${manifest.current}/download.pdf`
    );

    return fs.createReadStream(path);
  } catch {
    return createError({ statusCode: 404 });
  }
});
