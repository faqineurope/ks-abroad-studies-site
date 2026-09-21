import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a KS Abroad Studies student account to save your profile and documents.",
};

export default function RegisterPage() {
  return (
    <div className="site-shell py-12 md:py-16 max-w-xl">
      <p className="eyebrow">Student portal</p>
      <h1 className="display mt-3 text-4xl md:text-6xl">Register</h1>
      <p className="mt-4 text-lg text-[var(--ink-soft)] leading-relaxed">
        Make a profile, upload documents, and get catalogue matches for Italy.
      </p>
      <div className="panel rounded-3xl p-6 md:p-8 mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
