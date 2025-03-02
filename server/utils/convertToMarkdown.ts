import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import { unzipSync } from "fflate";
import tesseract from "node-tesseract-ocr";

export async function convertToMarkdown(
  downloadHash: string
): Promise<boolean> {
  const conversionOptions = {
    UseOcr: "true",
    Locale: "en",
    Password: null,
    PageRange: null,
  };

  const blob = await hubBlob().get(`plans/${downloadHash}/download.pdf`);
  if (!blob) throw new Error("Failed to retrieve the blob");

  const pdfBuffer = await blob.arrayBuffer().then(Buffer.from);

  const formData = new FormData();
  formData.append("ConversionOptions", JSON.stringify(conversionOptions));
  formData.append("1", new Blob([pdfBuffer]), "download.pdf");

  const asposeResp = await fetch(
    "https://api.products.aspose.app/words/conversion/api/convert?outputType=MD",
    {
      method: "POST",
      body: formData,
    }
  ).then((r: any) => r.json() as any);

  const downloadUrl =
    "https://api.products.aspose.app/words/conversion/api/Download?id=" +
    asposeResp.id;

  const response = await fetch(downloadUrl);
  if (!response.body)
    throw new Error(`Failed to download: ${response.statusText}`);

  const zipBuffer = await response.arrayBuffer().then(Buffer.from);
  const files = unzipSync(zipBuffer);

  const mdFile = files["download.md"];
  if (!mdFile) throw new Error("Failed to find download.md in the zip");

  await hubBlob().put(`plans/${downloadHash}/data.md`, mdFile);

  return false;
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
