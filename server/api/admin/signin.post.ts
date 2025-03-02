import bcrypt from "bcryptjs";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      password: z.string(),
    }).parse
  );

  if (!process.env.ADMIN_PASSWORD_HASH) return createError({ statusCode: 500 });

  if (bcrypt.compareSync(body.password, process.env.ADMIN_PASSWORD_HASH)) {
    await setUserSession(event, {
      user: {},
    });
  } else {
    return createError({ statusCode: 401 });
  }
});
