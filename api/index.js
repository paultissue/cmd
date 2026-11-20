export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const rawProvider = url.searchParams.get("provider");

  if (!rawProvider || rawProvider === "?") {
    url.searchParams.set("provider", "Kick");
  }

  const upstream = await fetch(`https://cmd.paultissue.workers.dev/${url.search}`);
  const text = await upstream.text();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(upstream.status).send(text);
}
