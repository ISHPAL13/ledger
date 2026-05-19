"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null as { error?: string } | null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
        <Input name="email" type="email" placeholder="admin@talosledger.demo" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
        <Input name="password" type="password" placeholder="Password123!" required />
      </div>
      {state?.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Login"}
      </Button>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Demo admin: <span className="font-semibold">admin@talosledger.demo</span> / <span className="font-semibold">Password123!</span>
      </div>
    </form>
  );
}
