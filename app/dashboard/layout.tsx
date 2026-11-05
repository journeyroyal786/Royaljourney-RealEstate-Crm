import { CrmShell } from "@/components/crm-shell";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}
