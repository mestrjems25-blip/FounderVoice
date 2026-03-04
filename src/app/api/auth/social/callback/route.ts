import { NextRequest, NextResponse } from "next/server";

const baseUrl = () =>
    process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Upload-Post handles the full OAuth handshake and redirects back here.
// Return an HTML page that works in both popup and full-page contexts:
//   - Popup: posts a message to the opener and closes itself.
//   - Full page (mobile / no opener): redirects to settings.
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = request.nextUrl;
    const error = searchParams.get("error");
    const base = baseUrl();

    if (error) {
        console.error("[social/callback] OAuth error:", error);
        const html = buildHtml(false, base);
        return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

    const html = buildHtml(true, base);
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

function buildHtml(success: boolean, fallbackBase: string): string {
    const type = success ? "social-connected" : "social-error";
    const fallback = success
        ? `${fallbackBase}/dashboard/settings?social=connected`
        : `${fallbackBase}/dashboard/settings?social=error`;

    return `<!DOCTYPE html>
<html>
<head><title>Connecting…</title></head>
<body style="margin:0;background:#0f0f14;display:flex;align-items:center;justify-content:center;height:100vh;">
  <p style="color:rgba(255,255,255,0.4);font-family:sans-serif;font-size:14px;">
    ${success ? "Connected! Closing…" : "Something went wrong. Closing…"}
  </p>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "${type}" }, "${fallbackBase}");
        setTimeout(() => window.close(), 300);
      } else {
        window.location.href = "${fallback}";
      }
    } catch {
      window.location.href = "${fallback}";
    }
  </script>
</body>
</html>`;
}
