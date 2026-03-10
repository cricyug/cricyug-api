let cache = {
  data: null,
  timestamp: 0
};

const CACHE_TIME = 2 * 60 * 1000; // 2 minutes

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_KEY = process.env.CRICKETDATA_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      apiStatus: "failure",
      reason: "API key missing",
      data: []
    });
  }

  const now = Date.now();

  // Return cache if fresh
  if (cache.data && now - cache.timestamp < CACHE_TIME) {
    return res.status(200).json({
      apiStatus: "success",
      source: "cache",
      total: cache.data.length,
      data: cache.data
    });
  }

  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const json = await response.json();

    if (json?.status === "failure") {
      return res.status(200).json({
        apiStatus: "failure",
        reason: json?.reason || "API failure",
        data: []
      });
    }

    const matches = Array.isArray(json?.data) ? json.data : [];

    // Save to cache
    cache.data = matches;
    cache.timestamp = now;

    return res.status(200).json({
      apiStatus: "success",
      source: "live",
      total: matches.length,
      data: matches
    });

  } catch (error) {
    return res.status(500).json({
      apiStatus: "failure",
      reason: "Server error fetching matches",
      data: []
    });
  }
}
