import { Resend } from "resend";

const resend_api_key = process.env.RESEND_API_KEY;
const configured_email_from = process.env.EMAIL_FROM;

if (!resend_api_key) {
  throw new Error("RESEND_API_KEY is not configured.");
}

if (!configured_email_from) {
  throw new Error("EMAIL_FROM is not configured.");
}

const resend = new Resend(resend_api_key);
const email_from: string = configured_email_from;

interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
}

export async function send_email({ to, subject, html }: SendEmailInput) {
  const { data, error } = await resend.emails.send({
    from: email_from,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
