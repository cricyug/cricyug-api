export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight request handle
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_KEY = process.env.CRICKETDATA_API_KEY || "demo";
  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    const matches = Array.isArray(json?.data) ? json.data : [];

    return res.status(200).json({
      data: matches
    });
  } catch (error) {
    return res.status(500).json({
      data: [],
      error: "Failed to fetch matches"
    });
  }
}
