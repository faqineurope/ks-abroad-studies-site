"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    const privacy = data.get("privacyConsent") === "on";
    const terms = data.get("termsConsent") === "on";
    const marketing = data.get("marketingConsent") === "on";

    if (password !== confirm) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }
    if (!privacy || !terms) {
      setError("Please accept the Privacy Policy and Terms to continue.");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          email: String(data.get("email") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          password,
          website: String(data.get("website") || ""),
          privacyConsent: privacy,
          termsConsent: terms,
          marketingConsent: marketing,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not register.");
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input
        className="input"
        name="name"
        required
        maxLength={80}
        placeholder="Full name"
        autoComplete="name"
      />
      <input
        className="input"
        name="email"
        type="email"
        required
        maxLength={120}
        placeholder="Email"
        autoComplete="email"
      />
      <input
        className="input"
        name="phone"
        maxLength={30}
        placeholder="WhatsApp (with country code)"
        autoComplete="tel"
      />
      <input
        className="input"
        name="password"
        type="password"
        required
        minLength={10}
        placeholder="Password (10+ chars, letters + numbers)"
        autoComplete="new-password"
      />
      <input
        className="input"
        name="confirm"
        type="password"
        required
        minLength={10}
        placeholder="Confirm password"
        autoComplete="new-password"
      />

      <label className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
        <input name="privacyConsent" type="checkbox" required className="mt-1" />
        <span>
          I have read and agree to the{" "}
          <Link href="/privacy" className="font-semibold text-[var(--sea-deep)] hover:underline" target="_blank">
            Privacy Policy
          </Link>
          . I consent to KS Abroad Studies collecting and processing my personal data
          (profile, contact details, and documents I upload) to provide portal and
          consultancy services.
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
        <input name="termsConsent" type="checkbox" required className="mt-1" />
        <span>
          I agree to the{" "}
          <Link href="/agreement" className="font-semibold text-[var(--sea-deep)] hover:underline" target="_blank">
            Consultancy agreement
          </Link>{" "}
          / terms of use.
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
        <input name="marketingConsent" type="checkbox" className="mt-1" />
        <span>
          Optional: send me WhatsApp / email updates about intakes and scholarships.
          I can unsubscribe anytime.
        </span>
      </label>

      {error ? (
        <p className="text-sm font-semibold text-[var(--coral)]">{error}</p>
      ) : null}
      <button className="btn btn-sea w-full" type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </button>
      <p className="text-sm text-[var(--ink-soft)]">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-[var(--sea-deep)] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
