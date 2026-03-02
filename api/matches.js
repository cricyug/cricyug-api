export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const API_KEY = process.env.CRICKETDATA_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing CRICKETDATA_API_KEY in Vercel env" });
    }

    // 1) Try currentMatches
    const url1 = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;
    const r1 = await fetch(url1);
    const j1 = await r1.json();

    const list1 = Array.isArray(j1?.data) ? j1.data : [];

    // ✅ If currentMatches has data → return it
    if (list1.length > 0) {
      return res.status(200).json(list1);
    }

    // 2) Fallback: try matches endpoint (often has more items)
    const url2 = `https://api.cricapi.com/v1/matches?apikey=${API_KEY}&offset=0`;
    const r2 = await fetch(url2);
    const j2 = await r2.json();

    const list2 = Array.isArray(j2?.data) ? j2.data : [];

    return res.status(200).json(list2);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch matches", details: String(e) });
  }
}
