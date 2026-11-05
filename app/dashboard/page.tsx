import Link from "next/link";
import { ArrowUpRight, Users, BadgeCheck, UserX, TrendingUp, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth";
export default async function Dashboard() {
  const { supabase, profile } = await requireUser();
  const [{ count: total }, { count: qualified }, { count: unqualified }, { count: won }, { data: upcoming }] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "qualified"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "unqualified"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "won"),
    supabase.from("leads").select("id,full_name,next_follow_up,status").not("next_follow_up","is",null).gte("next_follow_up",new Date().toISOString().slice(0,10)).order("next_follow_up").limit(6)
  ]);
  const cards = [
    { label:"Total leads", value:total ?? 0, icon:Users, tone:"bg-blue-50 text-blue-700" },
    { label:"Qualified leads", value:qualified ?? 0, icon:BadgeCheck, tone:"bg-emerald-50 text-emerald-700" },
    { label:"Unqualified leads", value:unqualified ?? 0, icon:UserX, tone:"bg-rose-50 text-rose-700" },
    { label:"Won conversions", value:won ?? 0, icon:TrendingUp, tone:"bg-amber-50 text-amber-800" }
  ];
  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-stone-500">Good to see you, {profile.full_name || "team member"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1><p className="mt-2 text-sm text-stone-500">Your real estate pipeline at a glance.</p></div><Link href="/leads/new" className="btn btn-primary">+ Add new lead</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({label,value,icon:Icon,tone})=><div className="panel p-5" key={label}><div className="flex items-center justify-between"><span className="text-sm text-stone-500">{label}</span><span className={`rounded-xl p-2 ${tone}`}><Icon size={18}/></span></div><p className="mt-4 text-3xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-stone-400">Current CRM records</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"><section className="panel p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Follow-up schedule</h2><p className="mt-1 text-xs text-stone-500">Upcoming lead follow-ups</p></div><CalendarClock className="text-amber-700" size={20}/></div>
      {upcoming?.length ? <div className="mt-4 divide-y divide-stone-100">{upcoming.map((lead:any)=><Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-stone-50"><div><p className="text-sm font-semibold">{lead.full_name}</p><p className="mt-1 text-xs capitalize text-stone-500">{lead.status}</p></div><span className="text-xs font-semibold text-amber-800">{lead.next_follow_up}</span></Link>)}</div> : <p className="mt-6 rounded-xl bg-stone-50 p-5 text-sm text-stone-500">No upcoming follow-ups. Add a follow-up date to a lead to see it here.</p>}
    </section><section className="panel p-5"><h2 className="font-bold">Quick access</h2><p className="mt-1 text-xs text-stone-500">Go to your department workspace</p><div className="mt-4 space-y-2">{[{href:"/leads",label:"Manage leads"},{href:"/operations",label:"Contracts & operations"},{href:"/finance",label:"Payments & invoices"},{href:"/team",label:"Team directory"}].map(x=><Link key={x.href} href={x.href} className="flex items-center justify-between rounded-xl border border-stone-100 p-3 text-sm font-semibold hover:border-amber-300 hover:bg-amber-50/40">{x.label}<ArrowUpRight size={16} className="text-stone-400"/></Link>)}</div></section></div>
  </div>;
}
