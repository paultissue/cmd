// Map each incoming Vercel hostname to its corresponding Cloudflare Worker origin
const UPSTREAM_BY_HOST = {
  "cmdbot.vercel.app": "https://cmd.paultissue.workers.dev",
  "cmdtest.vercel.app": "https://cmdtest.paultissue.workers.dev"
};

// Default upstream Worker if an unknown or preview hostname hits the relay
const DEFAULT_UPSTREAM_ORIGIN = "https://cmd.paultissue.workers.dev";

// Fallback base URL used when parsing relative request paths like "/commands?foo=bar"
const RELAY_BASE_URL = "https://cmdbot.vercel.app";

// Maximum time (in ms) to wait on the Worker before aborting and returning a clean timeout error
const TIMEOUT_MS = 7000;

export default async function handler(req, res) {
  try {
    // Step 1: Determine the incoming hostname and select the matching upstream Worker
    const rawHost = String(req.headers?.host || "")
      .split(":")[0]
      .toLowerCase();
    const upstreamOrigin = UPSTREAM_BY_HOST[rawHost] || DEFAULT_UPSTREAM_ORIGIN;

    // Step 2: Parse the incoming request URL safely so pathname and query parameters stay separated
    const baseForParse = rawHost ? `https://${rawHost}` : RELAY_BASE_URL;
    const url = new URL(req.url || "/", baseForParse);

    // Step 3: Normalize missing or unexpanded "$(provider)" placeholders to a safe default platform
    const provider = url.searchParams.get("provider");
    if (!provider || provider === "$(provider)") {
      url.searchParams.set("provider", "YouTube");
    }

    // Step 4: Build the full upstream Worker URL preserving both subpaths and query strings
    const targetUrl = `${upstreamOrigin}${url.pathname}${url.search}`;

    // Step 5: Forward the request to the Worker with browser-friendly headers and a timeout guard
    const upstream = await fetch(targetUrl, {
      method: req.method || "GET",
      headers: {
        // Helps avoid edge/WAF blocks on bot or non-browser clients
        "User-Agent": "Mozilla/5.0",
        // Preserves caller content preferences (such as HTML vs. plain text) when provided
        "Accept": req.headers?.accept || "*/*"
      },
      // Aborts hung upstream calls before they tie up the serverless function
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    // Step 6: Read the response body from the Worker as text so both chat replies and HTML pages pass through
    const body = await upstream.text();

    // Step 7: Mirror the Worker's HTTP status code and content type back to the caller
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "text/plain; charset=utf-8"
    );

    // Step 8: Disable caching so live chat commands always get fresh responses
    res.setHeader("Cache-Control", "no-store");

    // Step 9: Send the final response back to BotRix or the browser
    return res.send(body);
  } catch (err) {
    // Step 10: Distinguish timeouts (504) from general relay/network failures (502) and return plain text
    const timedOut = err?.name === "TimeoutError" || err?.name === "AbortError";
    res.status(timedOut ? 504 : 502);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.send(timedOut ? "Upstream timeout." : `Relay error: ${err.message}`);
  }
}
