import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Users, BriefcaseBusiness, Wallet, UserRound, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Lead management", icon: Users },
  { href: "/operations", label: "Operations", icon: BriefcaseBusiness },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/team", label: "Team", icon: UserRound }
];
export function Sidebar({ name, role }: { name: string; role: string }) {
  return <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-royal-950 text-white md:flex">
    <div className="border-b border-white/10 px-5 py-5"><Image src="/royal-journey-logo.png" alt="ROYAL JOURNEY" width={270} height={126} className="h-auto w-full rounded-md" priority /></div>
    <div className="px-5 py-5"><p className="text-xs uppercase tracking-[.18em] text-amber-300">Workspace</p><p className="mt-1 text-sm font-semibold">Real Estate CRM</p></div>
    <nav className="flex-1 space-y-1 px-3">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"><Icon size={17}/>{label}</Link>)}</nav>
    <div className="border-t border-white/10 p-4"><div className="mb-3"><p className="truncate text-sm font-semibold">{name}</p><p className="text-xs capitalize text-white/55">{role}</p></div><form action={signOut}><button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/70 hover:bg-white/10"><LogOut size={16}/> Sign out</button></form></div>
  </aside>;
}
