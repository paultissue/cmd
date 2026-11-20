// Minimal relay: forwards path + query string and sets a standard User-Agent
export default async function handler(req, res) {
  try {
    // Preserve both the path (e.g. /commands, /builtin) and query string (?platform=BotRix...)
    const targetUrl = `https://cmd.paultissue.workers.dev${req.url || "/"}`;

    const upstream = await fetch(targetUrl, {
      method: req.method || "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": req.headers?.accept || "*/*"
      }
    });

    const body = await upstream.text();

    // Pass through status and content type (text/plain for bot replies, text/html for pages)
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "text/plain; charset=utf-8"
    );

    return res.send(body);
  } catch (err) {
    res.status(502);
    return res.send(`Relay failed: ${err.message}`);
  }
}
