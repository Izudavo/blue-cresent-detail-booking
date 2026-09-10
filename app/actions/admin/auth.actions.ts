"use server";

import { cookies } from "next/headers";

import { login_admin, logout_admin } from "@/lib/server/auth/auth.service";

import { validate_login_admin_input } from "@/lib/server/auth/auth.validation";

import { hash_session_token } from "@/lib/server/auth/auth.utils";

const SESSION_COOKIE_NAME = "admin_session";

export async function login_admin_action(
  input: Parameters<typeof validate_login_admin_input>[0],
) {
  const validated_input = validate_login_admin_input(input);

  const { session_token, expires_at } = await login_admin(
    validated_input.username,
    validated_input.password,
  );

  const cookie_store = await cookies();

  cookie_store.set({
    name: SESSION_COOKIE_NAME,
    value: session_token,
    expires: expires_at,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return {
    success: true,
  };
}

export async function logout_admin_action() {
  const cookie_store = await cookies();

  const session_token = cookie_store.get(SESSION_COOKIE_NAME)?.value;

  if (session_token) {
    const session_token_hash = hash_session_token(session_token);

    await logout_admin(session_token_hash);
  }

  cookie_store.delete(SESSION_COOKIE_NAME);

  return {
    success: true,
  };
}
