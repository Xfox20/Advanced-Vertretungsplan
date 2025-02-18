import { max } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  await authenticate(event);

  return useDrizzle()
    .select({ value: max(tables.download.lastFetch) })
    .from(tables.download)
    .then((result) => result[0].value?.toString());
});
