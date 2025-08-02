import { z } from "zod";

export default defineEventHandler(async (event) => {
  await authenticate(event);

  const { hash } = await getValidatedQuery(
    event,
    z.object({ hash: z.string().regex(/^[0-9a-f]{40}$/) }).parse
  );

  return useDrizzle()
    .query.download.findFirst({
      where: () => eq(tables.download.hash, hash),
    })
    .then((result) => !!result);
});
