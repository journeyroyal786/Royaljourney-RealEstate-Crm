export type Role = "admin" | "marketing" | "sales" | "operations" | "finance";
export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "viewing" | "negotiation" | "won" | "lost";
export type Lead = {
  id: string; full_name: string; phone: string; email: string | null;
  property_interest: string | null; source: string; status: LeadStatus;
  assigned_to: string | null; next_follow_up: string | null;
  notes: string | null; created_at: string;
};
export const roles: Role[] = ["admin", "marketing", "sales", "operations", "finance"];
export const leadStatuses: LeadStatus[] = ["new", "contacted", "qualified", "unqualified", "viewing", "negotiation", "won", "lost"];
