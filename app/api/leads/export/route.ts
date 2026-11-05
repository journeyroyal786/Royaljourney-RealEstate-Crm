import { requireUser } from "@/lib/auth";

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^\s*[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("leads")
    .select("full_name,phone,email,property_interest,source,status,next_follow_up,notes,created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return new Response("Unable to export leads. Check database permissions.", { status: 500 });
  }

  const columns = ["full_name","phone","email","property_interest","source","status","next_follow_up","notes","created_at"];
  const rows = [columns.join(","), ...(data ?? []).map((lead) => columns.map((key) => csvCell(lead[key as keyof typeof lead])).join(","))];
  return new Response("\uFEFF" + rows.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="royal-journey-leads.csv"',
      "Cache-Control": "no-store"
    }
  });
}
