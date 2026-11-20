const FALLBACK_PROVIDER = "YouTube";
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);
const UPSTREAM_ORIGIN = "https://cmd.paultissue.workers.dev";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    const rawProvider = url.searchParams.get("provider");
    if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
      url.searchParams.set("provider", FALLBACK_PROVIDER);
    }

    const rawQuery = url.searchParams.get("query");
    url.searchParams.set("query", !rawQuery || rawQuery === "null" ? "" : rawQuery);

    const upstream = await fetch(`${UPSTREAM_ORIGIN}/${url.search}`);
    const text = await upstream.text();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(upstream.status).send(text);
  } catch {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(502).send("Relay upstream error");
  }
}
