"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, InputHTMLAttributes, useState } from "react";

type RegistrationForm = { shopName: string; name: string; email: string; password: string; confirmPassword: string };
const initialForm: RegistrationForm = { shopName: "", name: "", email: "", password: "", confirmPassword: "" };

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof RegistrationForm) {
    return (event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) { setError("Your passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopName: form.shopName, name: form.name, email: form.email, password: form.password }) });
      const data: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? "We could not create your account. Please try again."); return; }
      router.replace("/dashboard");
      router.refresh();
    } catch { setError("We could not reach DukaSmart. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f7fbfa] px-4 py-10 sm:py-16"><div className="mx-auto w-full max-w-md"><Link href="/" className="mb-8 inline-flex items-center gap-2 font-bold text-brand-dark"><span className="grid size-8 place-items-center rounded-lg bg-brand text-white">D</span>DukaSmart</Link><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-teal-950/5 sm:p-8"><h1 className="text-2xl font-bold tracking-tight">Set up your shop</h1><p className="mt-2 text-sm leading-6 text-slate-600">Create the owner account that will manage your DukaSmart workspace.</p><form className="mt-6 space-y-4" onSubmit={handleSubmit}><Field id="shopName" label="Shop name" value={form.shopName} onChange={update("shopName")} placeholder="e.g. Mwanzo Hardware" autoComplete="organization" /><Field id="name" label="Your name" value={form.name} onChange={update("name")} placeholder="e.g. Amina Juma" autoComplete="name" /><Field id="email" label="Email address" type="email" value={form.email} onChange={update("email")} placeholder="you@shop.co.tz" autoComplete="email" /><Field id="password" label="Password" type="password" value={form.password} onChange={update("password")} placeholder="At least 10 characters" autoComplete="new-password" minLength={10} hint="Use at least 10 characters." /><Field id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Repeat your password" autoComplete="new-password" minLength={10} />{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating your shop…" : "Create shop account"}</button></form><p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-brand-dark hover:underline">Sign in</Link></p></div></div></main>;
}

function Field({ id, label, hint, ...props }: { id: string; label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) { return <div><label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label><input id={id} required maxLength={120} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25" {...props} />{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>; }
