import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-panel">
        <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Account recovery</div>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Password reset support</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Talos Ledger is ready for a firm-managed reset workflow, but this starter build keeps recovery deliberately simple:
          admins can provision staff accounts, and password recovery should be wired to your preferred email provider before production rollout.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          For the seeded demo workspace, use <span className="font-semibold">admin@talosledger.demo</span> with <span className="font-semibold">Password123!</span>.
        </div>
        <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
          Back to login
        </Link>
      </div>
    </main>
  );
}
