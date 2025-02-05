import got from "got";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import fs from "fs";
import unzip from "unzip-stream";
import tesseract from "node-tesseract-ocr";

export async function convertToMarkdown(basePath: string): Promise<boolean> {
  const cookieJar = new CookieJar();

  const conversionOptions = {
    UseOcr: "true",
    Locale: "en",
    Password: null,
    PageRange: null,
  };

  const formData = new FormData();
  formData.append("ConversionOptions", JSON.stringify(conversionOptions));
  formData.append(
    "1",
    fs.readFileSync(`${basePath}/download.pdf`),
    "download.pdf"
  );

  const postResp = await got.post({
    url: "https://api.products.aspose.app/words/conversion/api/convert?outputType=MD",
    body: formData,
    cookieJar,
    retry: { limit: 3 },
  });

  const downloadUrl =
    "https://api.products.aspose.app/words/conversion/api/Download?id=" +
    JSON.parse(postResp.body).id;

  return await new Promise((resolve) => {
    got
      .stream({
        url: downloadUrl,
        cookieJar,
        retry: {
          limit: 3,
        },
      })
      .pipe(unzip.Extract({ path: `${basePath}/md` }))
      .on("close", () => cleanUpMarkdown(basePath).then(resolve));
  });
}

async function cleanUpMarkdown(basePath: string) {
  let mdContent = fs.readFileSync(`${basePath}/md/download.md`, "utf-8");
  let usedOcr = false;

  if (fs.readdirSync(`${basePath}/md`).length > 1) {
    const matches = mdContent.match(/Aspose\.Words\.[\da-f\-]*\.\d\d\d.png/g);

    for (const match of matches!) {
      const ocrResult = await tesseract.recognize(`${basePath}/md/${match}`, {
        lang: "deu+lat",
        psm: 6,
      });

      mdContent = mdContent.replace(`![](${match})`, ocrResult.trim());
    }

    usedOcr = true;
  }

  fs.writeFileSync(`${basePath}/data.md`, mdContent);
  fs.rmSync(`${basePath}/md`, { recursive: true, force: true });
  return usedOcr;
}
