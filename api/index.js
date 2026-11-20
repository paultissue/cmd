// Default provider when the incoming request doesn't supply one of the supported platforms.
const FALLBACK_PROVIDER = "YouTube";

// Case-insensitive allowlist of chat providers your upstream Worker explicitly recognizes.
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);

export default async function handler(req, res) {
  try {
    // Parse the incoming request URL so we can safely read and mutate query parameters.
    const url = new URL(req.url, `https://${req.headers.host}`);

    // Validate `provider` against the allowlist; fall back if missing or unrecognized.
    const rawProvider = url.searchParams.get("provider");
    if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
      url.searchParams.set("provider", FALLBACK_PROVIDER);
    }

    // Normalize `query` so literal "null" or missing values become an empty string,
    // while keeping intentional values like "?" intact for help/info commands.
    const platform = (url.searchParams.get("platform") || "").toLowerCase();
    let rawQuery = url.searchParams.get("query");

    if (!rawQuery || rawQuery === "null") {
      rawQuery = "";
    } else if (platform === "streamlabs") {
      // Streamlabs Cloudbot's {msg} often starts with "!command arg1 arg2"; strip the
      // leading "!command" token and surrounding whitespace so multi-word args stay clean.
      rawQuery = rawQuery.trim().replace(/^!\S+\s*/, "");
    }

    url.searchParams.set("query", rawQuery);

    // Forward the sanitized query string to the Cloudflare Worker and read its response body.
    const upstream = await fetch(`https://cmd.paultissue.workers.dev/${url.search}`);
    const text = await upstream.text();

    // Return plain text to the chat bot using the Worker's HTTP status code.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(upstream.status).send(text);
  } catch (err) {
    // Catch network/fetch failures to the upstream Worker so Vercel returns a clean 502.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(502).send("Relay upstream error");
  }
}
