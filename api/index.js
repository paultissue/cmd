const FALLBACK_PROVIDER = "YouTube";
const VALID_PROVIDERS = new Set(["youtube", "kick", "twitch"]);

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);

  const rawProvider = url.searchParams.get("provider");
  if (!rawProvider || !VALID_PROVIDERS.has(rawProvider.toLowerCase())) {
    url.searchParams.set("provider", FALLBACK_PROVIDER);
  }

  const platform = (url.searchParams.get("platform") || "").toLowerCase();
  let rawQuery = url.searchParams.get("query");

  if (!rawQuery || rawQuery === "null") {
    rawQuery = "";
  } else if (platform === "streamlabs") {
    // If Cloudbot {msg} includes the leading "!command" token, strip it
    rawQuery = rawQuery.trim().replace(/^!\S+\s*/, "");
  }

  url.searchParams.set("query", rawQuery);

  const upstream = await fetch(`https://cmd.paultissue.workers.dev/${url.search}`);
  const text = await upstream.text();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(upstream.status).send(text);
}
