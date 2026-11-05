import { CrmShell } from "@/components/crm-shell";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}
