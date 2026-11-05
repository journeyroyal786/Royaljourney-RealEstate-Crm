import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { requireUser } from "@/lib/auth";

const mobileLinks = [
  ["Dashboard", "/dashboard"],
  ["Leads", "/leads"],
  ["Operations", "/operations"],
  ["Finance", "/finance"],
  ["Team", "/team"]
] as const;

export async function CrmShell({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return <>
    <Sidebar name={profile.full_name || "Team member"} role={profile.role}/>
    <main className="min-h-screen md:pl-64">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur md:px-8">
        <span className="text-sm font-semibold text-stone-700">ROYAL JOURNEY <span className="font-normal text-stone-400">/ CRM</span></span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-800">{profile.role} access</span>
      </header>
      <nav aria-label="Mobile navigation" className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white px-3 py-2 md:hidden">
        {mobileLinks.map(([label, href]) => <Link key={href} href={href} className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-amber-50 hover:text-amber-900">{label}</Link>)}
      </nav>
      <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
    </main>
  </>;
}
