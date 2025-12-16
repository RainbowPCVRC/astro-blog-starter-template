export const onRequestPost: PagesFunction<{
  R2_UPLOADS: R2Bucket;
}> = async (context) => {
  const { request, env } = context;

  // Parse multipart form
  const form = await request.formData();

  const name = String(form.get("name") || "").trim();
  const replyTo = String(form.get("reply_to") || "").trim();
  const commissionType = String(form.get("commission_type") || "").trim();
  const details = String(form.get("details") || "").trim();

  // Collect files (input name="files" + multiple)
  const files = form.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);

  // Basic validation
  if (!name || !replyTo || !commissionType || !details) {
    return new Response("Missing required fields.", { status: 400 });
  }

  // Upload files to R2, collect public-ish links (we'll generate signed URLs later if you want)
  const uploaded: { key: string; name: string; size: number; type: string }[] = [];
  for (const f of files) {
    // Limit file size (10MB each)
    if (f.size > 10 * 1024 * 1024) continue;

    const safeName = f.name.replace(/[^\w.\-() ]+/g, "_");
    const key = `commission_uploads/${Date.now()}_${crypto.randomUUID()}_${safeName}`;

    await env.R2_UPLOADS.put(key, await f.arrayBuffer(), {
      httpMetadata: { contentType: f.type || "application/octet-stream" },
    });

    uploaded.push({ key, name: f.name, size: f.size, type: f.type || "unknown" });
  }

  // Build message body
  const lines: string[] = [];
  lines.push(`New commission request for RainbowVis`);
  lines.push(``);
  lines.push(`Name/Handle: ${name}`);
  lines.push(`Reply-To: ${replyTo}`);
  lines.push(`Commission Type: ${commissionType}`);
  lines.push(``);
  lines.push(`Details:`);
  lines.push(details);
  lines.push(``);
  lines.push(`Uploads (stored in R2):`);
  if (uploaded.length === 0) {
    lines.push(`- None`);
  } else {
    // NOTE: These are keys in R2. In the next step, I can give you a /download route that creates signed URLs.
    for (const u of uploaded) {
      lines.push(`- ${u.name} (${Math.round(u.size / 1024)} KB) | R2 Key: ${u.key}`);
    }
  }

  // Send email via MailChannels (works on Cloudflare Pages/Workers)
  // This delivers to your gmail: rainbowvis.co@gmail.com
  const emailPayload = {
    personalizations: [
      {
        to: [{ email: "rainbowvis.co@gmail.com", name: "RainbowVis" }],
        reply_to: { email: replyTo, name },
      },
    ],
    from: { email: "commissions@rainbowvis.space", name: "RainbowVis Site" },
    subject: `Commission Request: ${commissionType} — ${name}`,
    content: [
      { type: "text/plain", value: lines.join("\n") },
    ],
  };

  const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(emailPayload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return new Response(`Email failed: ${errText}`, { status: 502 });
  }

  // Nice success page
  return new Response(
    `Request sent! Thanks — RainbowVis will reply to you at ${replyTo}.`,
    { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } }
  );
};
