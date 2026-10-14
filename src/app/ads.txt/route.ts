export const dynamic = "force-dynamic";

export function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId || !/^ca-pub-\d+$/.test(clientId)) {
    return new Response("AdSense publisher ID is not configured.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(`google.com, ${clientId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}