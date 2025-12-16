import { COMMISSION_EMAIL_TO } from "../../consts";

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function POST({ request }: { request: Request }) {
  const form = await request.formData();

  const name = String(form.get("name") || "").trim();
  const replyTo = String(form.get("reply_to") || "").trim();
  const commissionType = String(form.get("commission_type") || "").trim();
  const details = String(form.get("details") || "").trim();
  const next = String(form.get("next") || "/commissions").trim();

  if (!name || !replyTo || !commissionType || !details) {
    return new Response("Missing required fields.", { status: 400 });
  }

  const files = form.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);

  // Limits (keeps Workers + email sane)
  const maxFiles = 5;
  const maxEach = 4 * 1024 * 1024; // 4MB each
  const safeFiles = files.slice(0, maxFiles).filter((f) => f.size <= maxEach);

  const attachments: any[] = [];
  for (const f of safeFiles) {
    const buf = new Uint8Array(await f.arrayBuffer());
    attachments.push({
      content: toBase64(buf),
      filename: f.name || "upload",
      type: f.type || "application/octet-stream",
      disposition: "attachment",
    });
  }

  const bodyText =
`New commission request

Name: ${name}
Reply-To: ${replyTo}
Commission Type: ${commissionType}

Details:
${details}

Files attached: ${attachments.length}/${files.length} (max ${maxFiles}, ${maxEach / (1024*1024)}MB each)
`;

  // MailChannels (works on Cloudflare Workers)
  const payload = {
    personalizations: [
      {
        to: [{ email: COMMISSION_EMAIL_TO }],
        reply_to: { email: replyTo, name },
      },
    ],
    from: {
      email: "no-reply@rainbowvis.space",
      name: "Rainbow's Creations",
    },
    subject: `Commission Request — ${commissionType} — ${name}`,
    content: [{ type: "text/plain", value: bodyText }],
    ...(attachments.length ? { attachments } : {}),
  };

  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return new Response(`Email send failed.\n${text}`, { status: 500 });
  }

  // Redirect to success page which auto-returns
  return Response.redirect(`/commissions/success?next=${encodeURIComponent(next)}`, 303);
}
