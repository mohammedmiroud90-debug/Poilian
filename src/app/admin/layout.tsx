import type { Metadata } from "next";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminShell } from "@/components/AdminShell";
import { currentAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) return <AdminLogin />;
  return <AdminShell>{children}</AdminShell>;
}
