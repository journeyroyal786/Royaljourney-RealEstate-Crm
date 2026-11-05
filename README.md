# ROYAL JOURNEY Real Estate CRM

A Next.js + TypeScript CRM starter built around the uploaded workflow: Marketing lead capture, Sales follow-up and qualification, Operations contracts, and Finance records. The supplied ROYAL JOURNEY logo is included at `public/royal-journey-logo.png`.

## Included modules

- Secure Supabase email/password sign-in
- Department role profile: `admin`, `marketing`, `sales`, `operations`, `finance`
- Dashboard totals: total, qualified, unqualified and won leads
- Lead create, search, status filter, assignment, editing and follow-up date
- Lead activity history for calls, emails, WhatsApp, meetings and notes
- Operations contract register for sale and rental agreements
- Finance transaction register for payments, invoices and commissions
- Supabase PostgreSQL schema and row-level security policies
- Responsive layout and Vercel-ready Next.js configuration

## Requirements

- Node.js 20.9 or later
- npm
- A Supabase project

## 1. Configure Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run the complete `supabase/schema.sql` file.
4. Open **Project Settings → API** and copy the Project URL and anon/public key.
5. In Supabase **Authentication → Providers**, ensure Email sign-in is enabled.

## 2. Create the first administrator

1. In Supabase **Authentication → Users**, create an account with the administrator's email and a secure password.
2. Copy the user's UUID.
3. In SQL Editor, run this statement after replacing the placeholders:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH_USER_UUID', 'CRM Administrator', 'admin');
```

The profile UUID must be exactly the same as the Auth user UUID. Do not expose the service-role key in browser code.

## 3. Run locally

```bash
npm install
cp .env.example .env.local
```

Set the real Supabase URL and anon key in `.env.local`, then:

```bash
npm run dev
```

Open http://localhost:3000 and sign in using the administrator account.

Before deploying, run:

```bash
npm run typecheck
npm run build
```

## 4. Add employees

Create each employee in **Supabase → Authentication → Users**. Then insert a matching profile row using that user's Auth UUID:

```sql
insert into public.profiles (id, full_name, role)
values
  ('AUTH_USER_UUID', 'Sales Agent Name', 'sales');
```

Supported roles: `admin`, `marketing`, `sales`, `operations`, `finance`.

The Team page is currently a read-only directory. Auth user provisioning is intentionally done through Supabase's admin interface; this project does not expose privileged service-role credentials to the browser.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, select **Add New → Project** and import the repository.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables.
4. Deploy. Vercel detects Next.js automatically.
5. If you use Supabase email confirmation or password reset later, add your production domain to Supabase Authentication → URL Configuration → Redirect URLs.

## 6. GitHub

```bash
git init
git add .
git commit -m "Initial ROYAL JOURNEY CRM"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

## Workflow mapping and implementation boundaries

| Workflow requirement | Included implementation |
|---|---|
| Meta Ads leads and contact details | Lead form with source, name, phone, email and property interest |
| Assign leads to sales agents | Profile-based assignment field |
| Calls, email and WhatsApp follow-ups | Lead activity log with activity type and notes |
| Qualified / unqualified | Lead status options |
| Follow-up dates and remarks | Follow-up date and lead notes |
| Sales and rental contracts | Operations contract register |
| Track signing | Draft, sent, signed and cancelled status |
| Payments, invoices, commissions | Finance record types and transaction history |
| Admin dashboard and conversions | Lead counts and won count |
| Employee login and role permissions | Supabase Auth + role-based RLS policies |
| Excel/CSV export | Authenticated CSV lead export is available from the Lead Management page |
| Meta Lead Ads automatic webhook ingestion | Not yet implemented; requires Meta app credentials, webhook verification and field mapping |
| WhatsApp / email sending | Activity logging only; outbound integrations are not configured |
| Invoice PDF generation and commission formula | Records are stored; templates/calculation rules were not specified |
| Contract document uploads | Database field reserved; Storage upload UI/policies not yet implemented |

## Security notes

- The Supabase anon key is designed for client-side use when Row Level Security is enabled.
- Never put the Supabase service-role key in `NEXT_PUBLIC_*` variables or client code.
- All business tables have RLS enabled.
- Finance records are restricted to Admin and Finance roles.
- Admin profile bootstrap is a deliberate manual step to avoid insecure public self-registration.
- This is a first deployable CRM foundation, not a legal/accounting compliance certification. Confirm access rules and financial processes with your organization before production use.

## Known setup checks

- A profile row is required for every Auth user before the user can enter the CRM.
- The first administrator must be bootstrapped manually as described above.
- Supabase SQL must be applied before the app can load its pages.
- This package cannot include your private Supabase project URL/key or create your hosted database.
