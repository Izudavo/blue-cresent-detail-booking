const MAX_USERNAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 200;

export interface LoginAdminInput {
  username: string;
  password: string;
}

export function validate_login_admin_input(
  input: LoginAdminInput,
): LoginAdminInput {
  const username = input.username.trim();

  const password = input.password;

  if (!username) {
    throw new Error("Username is required.");
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    throw new Error("Username is too long.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error("Password is too long.");
  }

  return {
    username,
    password,
  };
}
