"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

const leadSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().or(z.literal("")).optional(),
  property_interest: z.string().trim().max(200).optional(),
  source: z.string().trim().min(1).max(80),
  status: z.enum(["new","contacted","qualified","unqualified","viewing","negotiation","won","lost"]),
  assigned_to: z.string().uuid().or(z.literal("")).optional(),
  next_follow_up: z.string().optional(),
  notes: z.string().trim().max(5000).optional()
});

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/login?error=missing");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credentials");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createLead(formData: FormData) {
  const { supabase, user } = await requireUser(["admin","marketing","sales"]);
  const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/leads/new?error=validation");
  const values = parsed.data;
  const { data: createdLead, error } = await supabase.from("leads").insert({
    full_name: values.full_name, phone: values.phone,
    email: values.email || null, property_interest: values.property_interest || null,
    source: values.source, status: values.status,
    assigned_to: values.assigned_to || user.id, next_follow_up: values.next_follow_up || null,
    notes: values.notes || null, created_by: user.id
  }).select("id").single();
  if (error || !createdLead) redirect("/leads/new?error=save");
  await supabase.from("lead_activities").insert({
    lead_id: createdLead.id, user_id: user.id, activity_type: "note", body: "Lead created."
  });
  revalidatePath("/leads"); revalidatePath("/dashboard");
  redirect("/leads?created=1");
}

export async function updateLead(formData: FormData) {
  const { supabase, user } = await requireUser(["admin","marketing","sales"]);
  const id = String(formData.get("id") || "");
  if (!z.string().uuid().safeParse(id).success) redirect("/leads?error=id");
  const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect(`/leads/${id}?error=validation`);
  const v = parsed.data;
  const { data: previousLead } = await supabase.from("leads").select("status").eq("id", id).maybeSingle();
  if (!previousLead) redirect(`/leads/${id}?error=save`);
  const { error } = await supabase.from("leads").update({
    full_name: v.full_name, phone: v.phone, email: v.email || null,
    property_interest: v.property_interest || null, source: v.source, status: v.status,
    assigned_to: v.assigned_to || null, next_follow_up: v.next_follow_up || null,
    notes: v.notes || null
  }).eq("id", id);
  if (error) redirect(`/leads/${id}?error=save`);
  if (previousLead.status !== v.status) {
    await supabase.from("lead_activities").insert({
      lead_id: id, user_id: user.id,
      activity_type: "status", body: `Status changed from ${previousLead.status} to ${v.status}.`
    });
  }
  revalidatePath("/leads"); revalidatePath(`/leads/${id}`); revalidatePath("/dashboard"); redirect("/leads");
}

export async function addActivity(formData: FormData) {
  const { supabase, user } = await requireUser(["admin","sales","marketing","operations"]);
  const leadId = String(formData.get("lead_id") || "");
  const activityType = String(formData.get("activity_type") || "note");
  const body = String(formData.get("body") || "").trim();
  if (!z.string().uuid().safeParse(leadId).success || body.length < 2 || body.length > 3000) redirect(`/leads/${leadId}?error=activity`);
  const { error } = await supabase.from("lead_activities").insert({ lead_id: leadId, user_id: user.id, activity_type: activityType, body });
  if (error) redirect(`/leads/${leadId}?error=activity`);
  revalidatePath(`/leads/${leadId}`);
}

export async function createFinanceRecord(formData: FormData) {
  const { supabase, user } = await requireUser(["admin","finance"]);
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") || "").trim();
  const recordType = String(formData.get("record_type") || "");
  const leadId = String(formData.get("lead_id") || "");
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000 || description.length < 2 || !["payment","invoice","commission"].includes(recordType)) redirect("/finance?error=validation");
  const { error } = await supabase.from("finance_records").insert({
    amount, description, record_type: recordType, lead_id: leadId || null,
    currency: "AED", created_by: user.id, status: recordType === "payment" ? "received" : "pending"
  });
  if (error) redirect("/finance?error=save");
  revalidatePath("/finance");
  redirect("/finance?created=1");
}

export async function createContract(formData: FormData) {
  const { supabase, user } = await requireUser(["admin","operations"]);
  const leadId = String(formData.get("lead_id") || "");
  const contractType = String(formData.get("contract_type") || "");
  const status = String(formData.get("status") || "draft");
  const reference = String(formData.get("reference") || "").trim();
  if (!z.string().uuid().safeParse(leadId).success || !["sale","rental"].includes(contractType) || !["draft","sent","signed","cancelled"].includes(status) || reference.length < 2) redirect("/operations?error=validation");
  const { data: relatedLead } = await supabase.from("leads").select("id,status").eq("id", leadId).maybeSingle();
  if (!relatedLead || !["qualified","viewing","negotiation","won"].includes(relatedLead.status)) redirect("/operations?error=lead");
  const { error } = await supabase.from("contracts").insert({ lead_id: leadId, contract_type: contractType, status, reference, created_by: user.id });
  if (error) redirect("/operations?error=save");
  revalidatePath("/operations"); redirect("/operations?created=1");
}


export async function updateContract(formData: FormData) {
  const { supabase } = await requireUser(["admin","operations"]);
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!z.string().uuid().safeParse(id).success || !["draft","sent","signed","cancelled"].includes(status)) redirect("/operations?error=validation");
  const { error } = await supabase.from("contracts").update({ status }).eq("id", id);
  if (error) redirect("/operations?error=save");
  revalidatePath("/operations");
  redirect("/operations?updated=1");
}


export async function updateFinanceStatus(formData: FormData) {
  const { supabase } = await requireUser(["admin","finance"]);
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!z.string().uuid().safeParse(id).success || !["pending","received","paid","cancelled"].includes(status)) redirect("/finance?error=validation");
  const { error } = await supabase.from("finance_records").update({ status }).eq("id", id);
  if (error) redirect("/finance?error=save");
  revalidatePath("/finance");
  redirect("/finance?updated=1");
}
