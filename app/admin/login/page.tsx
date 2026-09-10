import { redirect } from "next/navigation";

import { get_current_admin } from "@/lib/server/auth/auth.session";

import { AuthScreen } from "./AuthScreen";

export default async function AdminLoginPage() {
  const admin = await get_current_admin();

  if (admin) {
    redirect("/dashboard");
  }

  return <AuthScreen />;
}
