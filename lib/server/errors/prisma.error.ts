import {
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const GENERIC_SERVER_ERROR_MESSAGE =
  "Something went wrong. Please try again later.";

export function get_prisma_error_message(
  error: unknown,
): string {
  if (
    error instanceof PrismaClientKnownRequestError ||
    error instanceof PrismaClientInitializationError ||
    error instanceof PrismaClientRustPanicError ||
    error instanceof PrismaClientUnknownRequestError ||
    error instanceof PrismaClientValidationError
  ) {
    return GENERIC_SERVER_ERROR_MESSAGE;
  }

  return GENERIC_SERVER_ERROR_MESSAGE;
}