import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const session = await getSessionUser();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-panel lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Create firm workspace</div>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Set up Talos Ledger for your CA firm</h1>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Each workspace is isolated to one CA firm, with admin and staff roles, client-wise uploads, AI extraction, and GST-ready exports.
            </p>
            <div className="mt-8 grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              <div>Admin can manage staff, clients, uploads, review, and exports.</div>
              <div>Staff can upload, review, and export reports within the same firm.</div>
              <div>All data stays scoped to your firm.</div>
            </div>
          </div>
          <div>
            <SignupForm />
            <div className="mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-600">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
