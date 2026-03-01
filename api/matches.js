export default async function handler(req, res) {
  try {
    const API_KEY = process.env.CRICKETDATA_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "Missing CRICKETDATA_API_KEY" });

    const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;
    const r = await fetch(url);
    const data = await r.json();

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
