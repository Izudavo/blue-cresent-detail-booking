import { prisma } from "@/lib/prisma";

import {
  generate_session_token,
  hash_session_token,
  verify_password,
} from "./auth.utils";

const SESSION_DURATION_DAYS = 7;

export async function login_admin(username: string, password: string) {
  const admin_user = await prisma.adminUser.findUnique({
    where: {
      username,
    },
  });

  if (!admin_user || !admin_user.is_active) {
    throw new Error("Invalid username or password.");
  }

  const password_valid = await verify_password(
    password,
    admin_user.password_hash,
  );

  if (!password_valid) {
    throw new Error("Invalid username or password.");
  }

  const session_token = generate_session_token();

  const session_token_hash = hash_session_token(session_token);

  const expires_at = new Date();

  expires_at.setDate(expires_at.getDate() + SESSION_DURATION_DAYS);

  await prisma.adminSession.create({
    data: {
      admin_user_id: admin_user.id,
      session_token: session_token_hash,
      expires_at,
    },
  });

  return {
    session_token,
    expires_at,
  };
}

export async function logout_admin(
  session_token_hash: string,
) {
  await prisma.adminSession.deleteMany({
    where: {
      session_token: session_token_hash,
    },
  });
}
