import { parseDate, parseDateTime } from "@internationalized/date";
import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
  await authenticate(event);

  const formData = await readFormData(event);

  const fetchedAtString = formData.get("fetchedAt") as string;
  const file = await (formData.get("file") as File | null)?.bytes();
  const providedHash = formData.get("hash") as string | undefined;
  const filename = formData.get("filename") as string | null;

  if (!fetchedAtString)
    throw createError({
      statusCode: 400,
      message: "fetchedAt is required.",
    });
  const fetchedAt = parseDateTime(fetchedAtString);

  let hash: string;
  if (file) {
    hash = crypto.hash("sha1", file, "hex");
  } else if (providedHash) {
    hash = providedHash;
  } else {
    throw createError({
      statusCode: 400,
      message: "File or hash must be provided.",
    });
  }

  const dateString = filename
    ?.match(/\d{2}\.\d{2}\.\d{4}/)?.[0]
    .split(".")
    .reverse()
    .join("-");
  const date = dateString ? parseDate(dateString) : null;

  const upsertResult = await useDrizzle()
    .insert(tables.download)
    .values({
      hash,
      firstFetch: fetchedAt,
      lastFetch: fetchedAt,
      date,
    })
    .onConflictDoUpdate({
      target: tables.download.hash,
      set: { lastFetch: fetchedAt },
    });

  const changed = !upsertResult.meta.rows_read;

  if (file && changed) {
    await hubBlob().put(`plans/${hash}/download.pdf`, file);

    try {
      await convertToMarkdown(hash);
      await parsePlan(hash, date);
    } catch (e) {
      console.warn(e);
    }
  }
});
