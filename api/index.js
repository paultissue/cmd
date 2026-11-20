export default async function handler(req, res) {
  try {
    const parsed = new URL(req.url, "https://cmdbot.vercel.app");
    const targetUrl = `https://cmd.paultissue.workers.dev${parsed.pathname}${parsed.search}`;

    const upstream = await fetch(targetUrl, {
      method: req.method || "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": upstreamAcceptHeader(req)
      }
    });

    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "text/html; charset=utf-8"
    );
    return res.send(body);
  } catch (err) {
    res.status(502);
    return res.send(`Relay failed: ${err?.message || String(err)}`);
  }
}

function upstreamAcceptHeader(req) {
  return req.headers?.accept || "*/*";
}
