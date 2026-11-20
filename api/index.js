export default async function handler(req, res) {
  try {
    const queryIndex = req.url.indexOf("?");
    const search = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
    const targetUrl = `https://cmd.paultissue.workers.dev/${search}`;

    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "text/plain; charset=utf-8");
    return res.send(text);
  } catch (err) {
    res.status(502);
    return res.send(`Relay failed: ${err.message}`);
  }
}
