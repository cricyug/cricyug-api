export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_KEY = process.env.CRICKETDATA_API_KEY || "demo";
  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    return res.status(200).json({
      usingDemoKey: API_KEY === "demo",
      hasRealKey: API_KEY !== "demo",
      apiStatus: json?.status || null,
      total: Array.isArray(json?.data) ? json.data.length : 0,
      rawKeys: Object.keys(json || {}),
      data: Array.isArray(json?.data) ? json.data : []
    });
  } catch (error) {
    return res.status(500).json({
      usingDemoKey: API_KEY === "demo",
      hasRealKey: API_KEY !== "demo",
      error: "Failed to fetch matches"
    });
  }
}
