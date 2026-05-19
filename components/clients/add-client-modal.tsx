"use client";

import { useRef } from "react";
import { createClientAction } from "@/lib/actions/clients";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CLIENT_STATUS_OPTIONS, INDIA_STATES } from "@/lib/constants";

export function AddClientModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Add Client
      </button>

      <dialog ref={dialogRef} className="backdrop:bg-slate-950/40 rounded-[32px] p-0">
        <div className="w-[min(92vw,820px)] rounded-[32px] border border-white/60 bg-white p-0 shadow-panel">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <div className="text-2xl font-bold text-slate-950">Add new client</div>
              <p className="mt-1 text-sm text-slate-500">
                Set up a business profile so invoices, bills, and bank statements stay grouped client-wise.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full px-3 py-2 text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <form action={createClientAction} className="max-h-[80vh] overflow-y-auto p-6 scrollbar-thin">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Business Name</label>
                <Input name="businessName" placeholder="ABC Traders Pvt Ltd" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Contact Person</label>
                <Input name="contactPersonName" placeholder="Full name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Business Type</label>
                <Input name="businessType" placeholder="Wholesaler, SME, CA client..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <Input name="email" placeholder="email@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                <Input name="phone" placeholder="10-digit mobile number" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">GST Number</label>
                <Input name="gstNumber" placeholder="27AABCT1234A1ZV" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">PAN Number</label>
                <Input name="panNumber" placeholder="AABCT1234A" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Business Address</label>
                <textarea
                  name="businessAddress"
                  placeholder="Street, Area"
                  className="min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                <Input name="city" placeholder="City" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">State</label>
                <Select name="state" defaultValue="">
                  <option value="">Select state</option>
                  {INDIA_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Pincode</label>
                <Input name="pincode" placeholder="6-digit pincode" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                <Select name="status" defaultValue="ACTIVE">
                  {CLIENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Any notes about filing workflow, preferred document naming, or review rules"
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Add Client
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
