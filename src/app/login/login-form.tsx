"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const previewPhoto = "https://lh3.googleusercontent.com/aida-public/AB6AXuCpnOPynl2DNEzMMEMMLXRYe31zl7PGZpWzRL8zmOsYArjSpbvkTWFNV6kLGr8GrpI5VpvJD_b_BIhpeR20Zj9HASMrCGXbW73K42iqkChPRDJmL0hlsqSGu4WlUQnK_M7gHKhI2wER8kogrvhZ7Jqx8uz6HVflz1IZaQq1W2zoKOEKndVIq8P53Eq7xkzxOBiwlGPmTAd2F8dXIwi5SHV5bMY5hR69belE2T8CmUwQ";

type Mode = "sign-in" | "sign-up";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const isSignUp = mode === "sign-up";
    const payload = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? ""), ...(isSignUp ? { displayName: String(formData.get("displayName") ?? "") } : {}) };
    try {
      const response = await fetch(`/api/auth?action=${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not complete sign-in.");
      router.push("/welcome");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not complete sign-in.");
    } finally {
      setSaving(false);
    }
  }

  const isSignUp = mode === "sign-up";
  return <main className="auth-page">
    <section className="auth-brand-panel">
      <div>
        <div className="auth-brand-row"><Link className="auth-brand" href="/"><span className="auth-brand-mark">M</span><span><strong>Make My Marriage</strong><small>Private registry</small></span></Link><Link className="auth-home-link" href="/">← Home</Link></div>
        <h1>Plan your wedding, together.</h1>
        <p>One private place for your events, family, guests, and every little detail.</p>
      </div>
      <div className="auth-preview"><Image src={previewPhoto} alt="Indian wedding ceremony decor" fill sizes="(max-width: 800px) 100vw, 42vw" unoptimized /><div><span>Aarav &amp; Meera&apos;s wedding · Jaipur</span><small>Preview workspace</small></div></div>
    </section>
    <section className="auth-form-panel">
      <div className="auth-form-wrap">
        <p className="auth-kicker">Your family workspace</p>
        <h2>{isSignUp ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-intro">{isSignUp ? "Start planning your celebration in one calm, shared place." : "Sign in to continue planning your celebration."}</p>
        <form className="auth-form" onSubmit={submit}>
          {isSignUp && <label>Name<input name="displayName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={8} maxLength={128} placeholder="At least 8 characters" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={saving}>{saving ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</button>
        </form>
        <p className="auth-switch">{isSignUp ? "Already have an account?" : "New to Make My Marriage?"} <button type="button" onClick={() => { setMode(isSignUp ? "sign-in" : "sign-up"); setError(""); }}>{isSignUp ? "Sign in" : "Create an account"}</button></p>
        <p className="auth-note">Local development authentication is enabled. Passwordless email sign-in will replace this flow when a provider is configured.</p>
      </div>
    </section>
  </main>;
}
