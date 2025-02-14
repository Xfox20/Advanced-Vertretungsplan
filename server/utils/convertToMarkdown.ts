import got from "got";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import fs from "fs";
import unzip from "unzip-stream";
import tesseract from "node-tesseract-ocr";

export async function convertToMarkdown(
  downloadHash: string
): Promise<boolean> {
  const cookieJar = new CookieJar();

  const conversionOptions = {
    UseOcr: "true",
    Locale: "en",
    Password: null,
    PageRange: null,
  };

  const buffer = await hubBlob()
    .get(`plans/${downloadHash}/download.pdf`)
    .then(async (b) => (b ? Buffer.from(await b.arrayBuffer()) : undefined));

  const formData = new FormData();
  formData.append("ConversionOptions", JSON.stringify(conversionOptions));
  formData.append("1", buffer, "download.pdf");

  const postResp = await got.post({
    url: "https://api.products.aspose.app/words/conversion/api/convert?outputType=MD",
    body: formData,
    cookieJar,
  });

  const downloadUrl =
    "https://api.products.aspose.app/words/conversion/api/Download?id=" +
    JSON.parse(postResp.body).id;

  const tempPath = `.data/temp/${downloadHash}`;

  fs.mkdirSync(tempPath, { recursive: true });

  const usedOcr = await new Promise<boolean>((resolve) => {
    got
      .stream({
        url: downloadUrl,
        cookieJar,
        retry: {
          limit: 5,
          maxRetryAfter: 5000,
        },
      })
      .pipe(unzip.Extract({ path: tempPath }))
      .on("close", () => cleanUpMarkdown(tempPath).then(resolve));
  });

  const mdContentBuffer = fs.readFileSync(`${tempPath}/data.md`);

  const arrayBuffer = new ArrayBuffer(mdContentBuffer.length);
  new Uint8Array(arrayBuffer).set(mdContentBuffer);

  await hubBlob().put(`plans/${downloadHash}/data.md`, arrayBuffer);

  fs.rmSync(tempPath, { recursive: true });

  return usedOcr;
}

async function cleanUpMarkdown(basePath: string) {
  let mdContent = fs.readFileSync(`${basePath}/download.md`, "utf-8");
  let usedOcr = false;

  if (fs.readdirSync(basePath).length > 1) {
    const matches = mdContent.match(/Aspose\.Words\.[\da-f\-]*\.\d\d\d.png/g);

    for (const match of matches!) {
      const ocrResult = await tesseract.recognize(`${basePath}/${match}`, {
        lang: "deu+lat",
        psm: 6,
      });

      mdContent = mdContent.replace(`![](${match})`, ocrResult.trim());
    }

    usedOcr = true;
  }

  fs.writeFileSync(`${basePath}/data.md`, mdContent);
  fs.rmSync(`${basePath}/download.md`);
  return usedOcr;
}
