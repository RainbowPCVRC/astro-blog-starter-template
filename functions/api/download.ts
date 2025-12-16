export const onRequestGet: PagesFunction<{
  R2_UPLOADS: R2Bucket;
}> = async ({ request, env }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Missing file key.", { status: 400 });
  }

  // Check if object exists
  const obj = await env.R2_UPLOADS.head(key);
  if (!obj) {
    return new Response("File not found.", { status: 404 });
  }

  // Generate signed URL (15 minutes)
  const signedUrl = await env.R2_UPLOADS.createSignedUrl(key, {
    expiresIn: 60 * 15, // 15 minutes
  });

  // Redirect user to the signed URL
  return Response.redirect(signedUrl, 302);
};
