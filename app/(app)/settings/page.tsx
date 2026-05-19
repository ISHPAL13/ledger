import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createStaffAction, updateSettingsAction } from "@/lib/actions/settings";
import { requireUser } from "@/lib/auth/session";
import { getFirmScopedShell } from "@/lib/data";

export default async function SettingsPage() {
  const user = await requireUser();
  const firm = await getFirmScopedShell(user.firmId);

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-3xl font-bold text-slate-950">Settings</div>
        <p className="mt-2 text-sm text-slate-500">Manage firm profile, extraction thresholds, export defaults, and staff access.</p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <form action={updateSettingsAction} className="space-y-6">
            <Card>
              <div className="text-2xl font-bold text-slate-950">Firm details</div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Firm Name</label>
                  <Input name="name" defaultValue={firm.name} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Owner Name</label>
                  <Input name="ownerName" defaultValue={firm.ownerName} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <Input name="email" defaultValue={firm.email} type="email" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                  <Input name="phone" defaultValue={firm.phone || ""} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">GST Number</label>
                  <Input name="gstNumber" defaultValue={firm.gstNumber || ""} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">PAN Number</label>
                  <Input name="panNumber" defaultValue={firm.panNumber || ""} />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Address</label>
                <Textarea name="address" defaultValue={firm.address || ""} className="min-h-24" />
              </div>
            </Card>

            <Card>
              <div className="text-2xl font-bold text-slate-950">Invoice processing preferences</div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Default Financial Year</label>
                  <Input name="defaultFinancialYear" defaultValue={firm.defaultFinancialYear} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Default Export Format</label>
                  <Select name="defaultExportFormat" defaultValue={firm.defaultExportFormat}>
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="csv">CSV</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Low confidence threshold</label>
                  <Input name="lowConfidenceThreshold" type="number" step="0.05" min="0" max="1" defaultValue={firm.lowConfidenceThreshold} />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input name="autoApproveHighConfidenceInvoices" type="checkbox" defaultChecked={firm.autoApproveHighConfidence} />
                  Auto-approve high confidence invoices
                </label>
              </div>
              <Button type="submit" className="mt-6">
                Save Settings
              </Button>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="text-2xl font-bold text-slate-950">Staff users</div>
            <div className="mt-5 space-y-4">
              {firm.users.map((staff) => (
                <div key={staff.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="font-semibold text-slate-950">{staff.fullName}</div>
                  <div className="mt-1 text-sm text-slate-500">{staff.email}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{staff.role}</div>
                </div>
              ))}
            </div>
            <form action={createStaffAction} className="mt-6 grid gap-3">
              <div className="text-sm font-semibold text-slate-700">Add staff member</div>
              <Input name="fullName" placeholder="Staff full name" />
              <Input name="email" type="email" placeholder="staff@firm.com" />
              <Input name="password" type="password" placeholder="Temporary password" />
              <Button type="submit" variant="secondary">
                Add Staff
              </Button>
            </form>
          </Card>

          <Card>
            <div className="text-2xl font-bold text-slate-950">Workflow defaults</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>Client uploads remain isolated to this firm workspace.</div>
              <div>Gemini extraction writes confidence scores for every invoice field.</div>
              <div>Approved invoices flow directly into GST summary reports and exports.</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
