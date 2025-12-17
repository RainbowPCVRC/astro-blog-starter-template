import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get("content-type") || "";

    // We expect multipart/form-data because you want file uploads.
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Bad Request: expected multipart form data", { status: 400 });
    }

    const form = await request.formData();

    // Example fields (adjust these to your form's actual names)
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const commissionType = String(form.get("commissionType") || "");
    const details = String(form.get("details") || "");

    // Files (if you have <input type="file" name="attachments" multiple>)
    const files = form.getAll("attachments").filter(Boolean) as File[];

    // TODO: Your email sending logic goes here.
    // If your existing code uses an email API, keep it and include fields + files.
    // NOTE: "mailto:" cannot send attachments; you need an email service (MailChannels, Resend, etc.)
    // For now, we just accept the form and redirect.

    // Redirect to your styled success screen
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/commissions/success",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Server error submitting commission request.", { status: 500 });
  }
};
