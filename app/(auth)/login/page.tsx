import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSessionUser();
  if (session) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-slate-950 p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-blue-200">
            ledger.talosinnovations.com
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-bold leading-tight">
            AI-powered GST invoice automation for CA firms.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-300">
            Talos Ledger gives chartered accountants a client-wise bill, invoice, and extraction workflow built for GST review, approvals, and exports.
          </p>
        </div>
        <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-8">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">What you get</div>
          <div className="grid gap-3 text-sm text-slate-200">
            <div>Client-wise dashboard for every CA engagement</div>
            <div>Gemini-powered invoice extraction with confidence scores</div>
            <div>GST-ready summaries, review queues, and Excel exports</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-panel">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Talos Ledger</div>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Sign in to your CA workspace</h2>
            <p className="mt-2 text-sm text-slate-500">Use the seeded demo account or create your own firm workspace.</p>
          </div>
          <LoginForm />
          <div className="mt-4 text-sm text-slate-500">
            Forgot password?{" "}
            <Link href="/forgot-password" className="font-semibold text-brand-600">
              Recovery options
            </Link>
          </div>
          <div className="mt-6 text-sm text-slate-500">
            New firm?{" "}
            <Link href="/signup" className="font-semibold text-brand-600">
              Create your account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
