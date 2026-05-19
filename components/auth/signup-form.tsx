"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, null as { error?: string } | null);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Firm Name</label>
        <Input name="firmName" placeholder="Sharma & Associates" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Owner Name</label>
        <Input name="ownerName" placeholder="Aarav Sharma" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
        <Input name="phone" placeholder="+91 99999 99999" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
        <Input name="email" type="email" placeholder="owner@firm.com" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">GST Number</label>
        <Input name="gstNumber" placeholder="27AAAAA0000A1Z5" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">PAN Number</label>
        <Input name="panNumber" placeholder="AAAAA0000A" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
        <Input name="password" type="password" placeholder="At least 8 characters" required />
      </div>
      {state?.error ? <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div> : null}
      <div className="sm:col-span-2">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating workspace..." : "Create CA Workspace"}
        </Button>
      </div>
    </form>
  );
}
