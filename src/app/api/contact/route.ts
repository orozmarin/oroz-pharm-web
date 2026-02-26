import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getPayload } from "payload";
import config from "@payload-config";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string().min(1),
  message: z.string().min(10),
});

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "noreply@orozpharm.hr";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "perica@orozpharm.hr";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtjev." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validacijska greška." },
      { status: 422 },
    );
  }

  const { name, email, phone, category, message } = parsed.data;

  // 1. Pohrana u Payload
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "contact-submissions",
      data: {
        name,
        email,
        phone: phone ?? null,
        category,
        message,
        status: "novo",
      },
    });
  } catch (err) {
    console.error("[contact] Payload create error:", err);
    return NextResponse.json(
      { error: "Greška pri pohrani upita." },
      { status: 500 },
    );
  }

  // 2. Admin notifikacija
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Novi upit — ${category} — ${name}`,
      html: adminEmailHtml({ name, email, phone, category, message }),
    });
  } catch (err) {
    console.error("[contact] Resend admin email error:", err);
    // Ne blokiramo odgovor ako admin mail ne prođe
  }

  // 3. Auto-reply potvrdni mail
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Vaš upit je primljen — Oroz PHARM",
      html: autoReplyHtml({ name, category, message }),
    });
  } catch (err) {
    console.error("[contact] Resend auto-reply error:", err);
    // Ne blokiramo odgovor ako auto-reply ne prođe
  }

  return NextResponse.json({ success: true });
}

function adminEmailHtml(data: {
  name: string;
  email: string;
  phone?: string;
  category: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html lang="hr">
<head><meta charset="utf-8" /></head>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #166534; margin-bottom: 4px;">Novi upit s web stranice</h2>
  <p style="color: #6b7280; margin-top: 0; margin-bottom: 24px;">Primljeno putem kontaktne forme na orozpharm.hr</p>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; width: 140px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Ime i prezime</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${escHtml(data.name)}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${escHtml(data.email)}" style="color: #166534;">${escHtml(data.email)}</a></td>
    </tr>
    ${
      data.phone
        ? `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Telefon</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escHtml(data.phone)}</td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Kategorija</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escHtml(data.category)}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; vertical-align: top; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Poruka</td>
      <td style="padding: 10px 0; white-space: pre-line;">${escHtml(data.message)}</td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function autoReplyHtml(data: {
  name: string;
  category: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html lang="hr">
<head><meta charset="utf-8" /></head>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #166534; margin-bottom: 4px;">Hvala, ${escHtml(data.name)}!</h2>
  <p style="color: #374151; margin-top: 0; margin-bottom: 16px;">
    Vaša poruka je primljena. Javit ćemo vam se u najkraćem roku, najčešće unutar jednog radnog dana.
  </p>

  <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Vaš upit</p>
    <p style="margin: 0 0 4px;"><strong>Kategorija:</strong> ${escHtml(data.category)}</p>
    <p style="margin: 0; white-space: pre-line;">${escHtml(data.message)}</p>
  </div>

  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
    Oroz PHARM — Pleternica i Požega<br />
    Radno vrijeme: pon–pet 07:00–17:00, sub 07:00–13:00
  </p>
  <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
    Ovu poruku primili ste jer ste ispunili kontaktnu formu na stranici orozpharm.hr.
  </p>
</body>
</html>
  `.trim();
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
