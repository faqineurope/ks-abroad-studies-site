import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/lib/site";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (row.count >= MAX_PER_WINDOW) return false;
  row.count += 1;
  return true;
}

function clean(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many messages. Please wait a minute." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Honeypot filled => pretend success
    if (clean(body.website, 200)) {
      return NextResponse.json({ ok: true });
    }

    const name = clean(body.name, 80);
    const email = clean(body.email, 120);
    const phone = clean(body.phone, 30);
    const purpose = clean(body.purpose, 80);
    const message = clean(body.message, 2000);

    if (!name || !email || !purpose || !message) {
      return NextResponse.json(
        { ok: false, error: "Please fill name, email, purpose, and message." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const to = process.env.CONTACT_TO_EMAIL || SITE.email;
    const subject = `KS Abroad inquiry · ${purpose} · ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone/WhatsApp: ${phone || "—"}`,
      `Purpose: ${purpose}`,
      "",
      message,
      "",
      `— Sent from ${SITE.name} contact form`,
    ].join("\n");

    // Prefer FormSubmit (works with Gmail after one confirmation click)
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        _replyto: email,
        phone,
        purpose,
        message: text,
        _subject: subject,
        _template: "table",
        _captcha: "false",
      }),
    });

    if (!formSubmitRes.ok) {
      const detail = await formSubmitRes.text().catch(() => "");
      console.error("contact formsubmit failed", formSubmitRes.status, detail.slice(0, 300));
      return NextResponse.json(
        {
          ok: false,
          error:
            "Email service unavailable right now. Please WhatsApp us or email directly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact error", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected error. Please try WhatsApp." },
      { status: 500 },
    );
  }
}
