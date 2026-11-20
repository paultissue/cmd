// Default provider when the incoming request does not supply one of the supported platforms.
const FALLBACK_PROVIDER = "YouTube";

// Case-insensitive allowlist of chat providers your upstream Worker explicitly recognizes.
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);

export default async function handler(req, res) {
  try {
    // Parse the incoming request URL so we can safely read and update query parameters.
    const url = new URL(req.url, `https://${req.headers.host}`);

    // Normalize `provider` so missing, empty, or unrecognized values fall back cleanly.
    const rawProvider = url.searchParams.get("provider");
    if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
      url.searchParams.set("provider", FALLBACK_PROVIDER);
    }

    // Read platform and query values; keep `?` intact while normalizing missing or "null" values.
    const platform = (url.searchParams.get("platform") || "").toLowerCase();
    let rawQuery = url.searchParams.get("query");

    if (!rawQuery || rawQuery === "null") {
      rawQuery = "";
    } else if (platform === "streamlabs") {
      // Streamlabs Cloudbot's {msg} often starts with "!command arg1 arg2"; strip the
      // leading "!command" token and whitespace so arguments and multi-word queries remain intact.
      rawQuery = rawQuery.trim().replace(/^!\S+(?:\s+|$)/, "");
    }

    // Write the normalized query back to the search parameters.
    url.searchParams.set("query", rawQuery);

    // Log request details for debugging Streamlabs / multi-bot query parsing in Vercel logs.
    console.log(
      "Relay request:",
      JSON.stringify({
        platform,
        provider: url.searchParams.get("provider"),
        rawQuery: req.url,
        cleanedQuery: rawQuery,
        forwardedSearch: url.search,
      })
    );

    // Forward the sanitized query string to the upstream Cloudflare Worker.
    const upstream = await fetch(`https://cmd.paultissue.workers.dev/${url.search}`);
    const text = await upstream.text();

    // Return the Worker's response body and status code as plain text.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(upstream.status).send(text);
  } catch (err) {
    // Log unexpected relay/network errors and return a 502 Bad Gateway response.
    console.error("Relay upstream error:", err);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(502).send("Relay upstream error");
  }
}
