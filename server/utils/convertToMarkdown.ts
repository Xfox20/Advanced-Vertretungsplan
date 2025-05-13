import fetch from "node-fetch";
import { unzipSync } from "fflate";

export async function convertToMarkdown(downloadHash: string) {
  const conversionOptions = {
    UseOcr: "true",
    Locale: "en",
    Password: null,
    PageRange: null,
  };

  const blob = await hubBlob().get(`plans/${downloadHash}/download.pdf`);
  if (!blob) throw new Error("Failed to retrieve the blob");

  const pdfBuffer = await blob.arrayBuffer().then(Buffer.from);

  const formData: any = new FormData();
  formData.append("ConversionOptions", JSON.stringify(conversionOptions));
  formData.append("1", new Blob([pdfBuffer]), "download.pdf");

  const asposeResp = await fetch(
    "https://api.products.aspose.app/words/conversion/api/convert?outputType=MD",
    { method: "POST", body: formData }
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

  if (/\|.*!\[.*\]\(.*\).*\|/.test(Buffer.from(mdFile).toString())) {
    throw new Error("Image detected in the markdown table");
  }

  await hubBlob().put(`plans/${downloadHash}/data.md`, mdFile);
}
