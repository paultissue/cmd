// Default provider when the incoming request doesn't supply one of the supported platforms.
const FALLBACK_PROVIDER = "YouTube";

// Case-insensitive allowlist of chat providers your upstream Worker explicitly recognizes.
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);

export default async function handler(req, res) {
  try {
    // Parse the incoming request URL so we can safely read and mutate query parameters.
    const url = new URL(req.url, `https://${req.headers.host}`);

    // Normalize `provider` so missing or unrecognized values fall back cleanly.
    const rawProvider = url.searchParams.get("provider");
    if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
      url.searchParams.set("provider", FALLBACK_PROVIDER);
    }

    // Normalize `query` so missing or "null" values become an empty string,
    // while preserving intentional values like "?" for help/info commands.
    const rawQuery = url.searchParams.get("query");
    if (!rawQuery || rawQuery === "null") {
      url.searchParams.set("query", "");
    }

    // Forward the sanitized query string to the upstream Cloudflare Worker.
    const upstream = await fetch(`https://cmd.paultissue.workers.dev/${url.search}`);
    const text = await upstream.text();

    // Return the Worker's response body and status code as plain text.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(upstream.status).send(text);
  } catch (err) {
    // Catch unexpected fetch failures to the upstream Worker and return a clean 502.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(502).send("Relay upstream error");
  }
}
