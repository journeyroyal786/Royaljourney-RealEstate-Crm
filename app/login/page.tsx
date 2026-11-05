import Image from "next/image";
import { signIn } from "@/app/actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const messages: Record<string,string> = { credentials: "Email or password is incorrect.", missing: "Enter your email and password.", profile: "Your account profile is inactive or not configured." };
  return <main className="flex min-h-screen items-center justify-center bg-[#f4f0ed] px-4 py-10">
    <section className="panel w-full max-w-md overflow-hidden">
      <div className="bg-royal-950 p-7"><Image src="/royal-journey-logo.png" alt="ROYAL JOURNEY" width={300} height={140} className="mx-auto h-auto w-64 rounded-md"/></div>
      <div className="p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-700">Secure workspace</p><h1 className="mt-2 text-2xl font-bold">Sign in to your CRM</h1><p className="mt-2 text-sm text-stone-500">Use the account provided by your CRM administrator.</p>
        {params.error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{messages[params.error] || "Unable to complete sign in. Please try again."}</p>}
        <form action={signIn} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Email<input className="field mt-1.5" type="email" name="email" autoComplete="username" required/></label><label className="block text-sm font-semibold">Password<input className="field mt-1.5" type="password" name="password" autoComplete="current-password" required/></label><button className="btn btn-primary w-full py-3" type="submit">Sign in</button></form>
      </div>
    </section>
  </main>;
}
