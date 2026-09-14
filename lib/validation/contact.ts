import { z } from "zod";

const US_PHONE_PATTERN = /^(?:\+1[\s.-]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/;

export const email_schema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

export const us_phone_schema = z
  .string()
  .trim()
  .regex(US_PHONE_PATTERN, "Enter a valid US phone number.");

export const customer_contact_schema = z.object({
  email: email_schema,
  phone: us_phone_schema,
});
