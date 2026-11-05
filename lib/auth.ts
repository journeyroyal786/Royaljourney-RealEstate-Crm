import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function requireUser(allowed?: Role[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role, active").eq("id", user.id).maybeSingle();
  if (!profile || !profile.active) redirect("/login?error=profile");
  if (allowed && !allowed.includes(profile.role as Role)) redirect("/dashboard?error=permission");
  return { supabase, user, profile };
}
