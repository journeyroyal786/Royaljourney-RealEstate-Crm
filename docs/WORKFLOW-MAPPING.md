# ROYAL JOURNEY CRM — workflow extraction

The uploaded Word document describes the following business process:

## Marketing
- Receive leads from Meta Ads.
- Capture name, phone, email and property interest.
- Automatically register leads.
- Assign leads to sales agents.

## Sales agents
- Cold calling.
- Email follow-ups.
- WhatsApp follow-ups.
- Confirm customer requirements.
- Mark leads Qualified or Unqualified.
- Record follow-up dates and remarks.

## Operations
- Receive qualified leads.
- Prepare sales contracts.
- Prepare rental agreements.
- Track contract signing.
- Update transaction status.

## Finance
- Record payments received.
- Generate invoices.
- Track outstanding payments.
- Calculate and record commissions.
- Maintain financial transaction history.

## Requested CRM features
- Admin dashboard with total, qualified, unqualified and conversion counts.
- Individual employee login and role-based permissions.
- Lead assignment and reassignment.
- Complete lead activity history.
- Follow-up reminders.
- Sales pipeline and status tracking.
- Operations and finance dashboards.
- Search, filtering and Excel/CSV export.
- Responsive desktop/mobile interface.
- ROYAL JOURNEY branding.

## Technology in the source document
Next.js + TypeScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth, Vercel, GitHub and Supabase Storage.

## Scope notes
This implementation includes the CRM foundation and basic department registers. The source document does not specify Meta webhook credentials, commission percentages/formulas, invoice numbering/tax rules, contract templates, or email/WhatsApp provider credentials. These integrations and business rules must be supplied before those features can be implemented safely.
