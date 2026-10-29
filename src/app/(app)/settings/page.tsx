import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import EmployeesSettings from "./employees-settings";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/dashboard");

  return <EmployeesSettings showEmployees={session.role === "OWNER"} />;
}