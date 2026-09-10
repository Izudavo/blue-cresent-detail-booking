import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { promisify } from "node:util";

const scrypt_async = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hash_password(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");

  const derived_key = (await scrypt_async(
    password,
    salt,
    KEY_LENGTH,
  )) as Buffer;

  return `${salt}:${derived_key.toString("hex")}`;
}

export async function verify_password(
  password: string,
  stored_hash: string,
): Promise<boolean> {
  const [salt, stored_key] = stored_hash.split(":");

  if (!salt || !stored_key) {
    return false;
  }

  const derived_key = (await scrypt_async(
    password,
    salt,
    KEY_LENGTH,
  )) as Buffer;

  const stored_key_buffer = Buffer.from(stored_key, "hex");

  if (stored_key_buffer.length !== derived_key.length) {
    return false;
  }

  return timingSafeEqual(derived_key, stored_key_buffer);
}

export function generate_session_token(): string {
  return randomBytes(32).toString("hex");
}

export function hash_session_token(session_token: string): string {
  return createHash("sha256").update(session_token).digest("hex");
}
