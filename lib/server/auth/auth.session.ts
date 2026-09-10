import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import { hash_session_token } from "./auth.utils";

const SESSION_COOKIE_NAME = "admin_session";

export async function get_current_admin() {
  const cookie_store = await cookies();

  const session_token = cookie_store.get(SESSION_COOKIE_NAME)?.value;

  if (!session_token) {
    return null;
  }

  const session_token_hash = hash_session_token(session_token);

  const session = await prisma.adminSession.findUnique({
    where: {
      session_token: session_token_hash,
    },
    include: {
      admin_user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expires_at <= new Date()) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  if (!session.admin_user.is_active) {
    return null;
  }

  return session.admin_user;
}
