const UPSTREAM_ORIGIN = "https://cmd.paultissue.workers.dev";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "https://cmdbot.vercel.app");
    const upstreamUrl = `${UPSTREAM_ORIGIN}${url.pathname}${url.search}`;

    const upstream = await fetch(upstreamUrl);
    const contentType = upstream.headers.get("content-type") || "text/plain; charset=utf-8";
    const body = await upstream.text();

    res.setHeader("Content-Type", contentType);
    return res.status(upstream.status).send(body);
  } catch (err) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(502).send(`Relay error: ${err?.message || String(err)}`);
  }
}
