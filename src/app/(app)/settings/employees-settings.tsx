"use client";

import { FormEvent, useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function EmployeesSettings() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/settings/employees", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load employees.");
        return payload.employees as Employee[];
      })
      .then((data) => { if (active) setEmployees(data); })
      .catch((fetchError: unknown) => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : "Could not load employees.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [refreshToken]);

  async function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not add employee.");
      setName("");
      setEmail("");
      setPassword("");
      setNotice("Employee added. Share their sign-in details with them.");
      setRefreshToken((token) => token + 1);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Could not add employee.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(employee: Employee) {
    if (!window.confirm(`Remove ${employee.name} from this shop? They will no longer be able to sign in.`)) return;
    setRemovingId(employee.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/settings/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not remove employee.");
      setEmployees((current) => current.filter((item) => item.id !== employee.id));
      setNotice(`${employee.name} was removed from this shop.`);
    } catch (removeError: unknown) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove employee.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Shop settings</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Employees</h1>
        <p className="mt-2 text-sm text-slate-600">Manage who can access this shop.</p>
      </header>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Add an employee</h2>
        <form onSubmit={addEmployee} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={120} className="rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" className="rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:max-w-sm">
            Temporary password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} maxLength={128} autoComplete="new-password" className="rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
            <span className="font-normal text-slate-500">At least 10 characters</span>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Adding…" : "Add employee"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Current employees</h2>
          <span className="text-sm text-slate-500">{employees.length}</span>
        </div>
        {loading ? (
          <p className="py-6 text-sm text-slate-500">Loading employees…</p>
        ) : employees.length === 0 ? (
          <p className="border-y border-slate-200 py-6 text-sm text-slate-500">No employees have been added yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {employees.map((employee) => (
              <li key={employee.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{employee.name}</p>
                  <p className="truncate text-sm text-slate-500">{employee.email}</p>
                </div>
                <button type="button" onClick={() => removeEmployee(employee)} disabled={removingId === employee.id} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60">
                  {removingId === employee.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}