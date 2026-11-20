// Base URL of the upstream Cloudflare Worker handling command logic and HTML pages
const UPSTREAM_ORIGIN = "https://cmd.paultissue.workers.dev";

// Timeout in milliseconds for upstream Worker requests so functions fail fast on stalls
const UPSTREAM_TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  try {
    // Parse pathname and query string safely even if req.url is relative
    const parsedUrl = new URL(req.url || "/", "https://cmdbot.vercel.app");
    const targetUrl = `${UPSTREAM_ORIGIN}${parsedUrl.pathname}${parsedUrl.search}`;

    const method = req.method || "GET";
    const hasBody = method !== "GET" && method !== "HEAD";

    // Send a browser-compatible User-Agent so upstream/edge layers don't reject BotRix traffic
    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": req.headers?.accept || "*/*"
    };

    // Forward Content-Type when sending a request body (e.g., POST)
    if (hasBody && req.headers?.["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: hasBody && req.body
        ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body))
        : undefined,
      // Abort stalled upstream requests before hitting Vercel function timeout limits
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });

    const responseBody = await upstream.text();

    // Preserve upstream status code and content type (text/plain for chat bots, text/html for pages)
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "text/plain; charset=utf-8"
    );

    // Prevent edge/client caching of live chat command responses
    res.setHeader("Cache-Control", "no-store");

    return res.send(responseBody);
  } catch (err) {
    // Return a clear 502/504-style error message rather than letting the invocation hang
    const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    res.status(isTimeout ? 504 : 502);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.send(
      isTimeout
        ? "Upstream Worker timed out."
        : `Relay failed: ${err?.message || String(err)}`
    );
  }
}
