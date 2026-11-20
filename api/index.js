export default async function handler(req, res) {
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const upstream = await fetch(`https://cmd.paultissue.workers.dev/${query}`);
  const text = await upstream.text();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(upstream.status).send(text);
}
