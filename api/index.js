const FALLBACK_PROVIDER = "YouTube"; // or "YouTube|Kick|Twitch"
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);

  const rawProvider = url.searchParams.get("provider");
  if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
    url.searchParams.set("provider", FALLBACK_PROVIDER);
  }

  const rawQuery = url.searchParams.get("query");
  if (!rawQuery || rawQuery === "null") {
    url.searchParams.set("query", "");
  }

  const upstream = await fetch(`https://cmd.paultissue.workers.dev/${url.search}`);
  const text = await upstream.text();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(upstream.status).send(text);
}
