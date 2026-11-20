// Default streaming platform when `provider` is missing or not in VALID_PROVIDERS
const FALLBACK_PROVIDER = "YouTube";

// Case-insensitive allowlist of supported streaming platforms
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);

// Base URL of the upstream Cloudflare Worker handling command requests
const UPSTREAM_ORIGIN = "https://cmd.paultissue.workers.dev";

export default async function handler(req, res) {
  try {
    // Parse the incoming request URL and query string using the request host as base
    const url = new URL(req.url, `https://${req.headers.host}`);

    // Validate `provider`; fall back to YouTube if omitted or unrecognized
    const rawProvider = url.searchParams.get("provider");
    if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
      url.searchParams.set("provider", FALLBACK_PROVIDER);
    }

    // Normalize missing or literal "null" query values to an empty string
    const rawQuery = url.searchParams.get("query");
    url.searchParams.set("query", !rawQuery || rawQuery === "null" ? "" : rawQuery);

    // Forward the normalized query string to the upstream Worker
    const upstream = await fetch(`${UPSTREAM_ORIGIN}/${url.search}`);
    const text = await upstream.text();

    // Return the upstream plain-text response and status code to the caller
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(upstream.status).send(text);
  } catch {
    // Return a 502 Bad Gateway response if URL parsing or the upstream fetch fails
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(502).send("Relay upstream error");
  }
}
