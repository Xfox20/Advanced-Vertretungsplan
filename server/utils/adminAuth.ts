import bcrypt from "bcryptjs";
import { H3Event } from "h3";

export async function authenticate(event: H3Event) {
  const authHeader = getHeader(event, "Authorization");

  if (!(await authenticateWithHeader(authHeader))) {
    await requireUserSession(event);
  }
}

async function authenticateWithHeader(authHeader: string | undefined) {
  if (!process.env.ADMIN_PASSWORD_HASH || !authHeader) {
    return false;
  }

  if (!authHeader.startsWith("Basic ")) {
    throw createError({
      statusCode: 400,
      message: "Only Basic authorization is supported",
    });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString();
  const password = credentials.split(":").pop();

  if (!password) throw createError({ statusCode: 400 });

  if (!bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)) {
    throw createError({ statusCode: 401 });
  }

  return true;
}
