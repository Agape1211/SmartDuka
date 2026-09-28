import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const shopResult = await query(`SELECT name FROM shops WHERE id = $1`, [
    session.shopId,
  ]);
  const shopName = shopResult.rows[0]?.name ?? "Duka";

  return (
    <AppShell role={session.role} name={session.name} shopName={shopName}>
      {children}
    </AppShell>
  );
}
