let cache = {
  data: null,
  timestamp: 0
};

const CACHE_TIME = 2 * 60 * 1000; // 2 minutes

export default async function handler(req, res) {
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

  if (cache.data && now - cache.timestamp < CACHE_TIME) {
    return res.status(200).json({
      apiStatus: "success",
      source: "cache",
      data: cache.data
    });
  }

  const url = `https://api.cricketdata.org/v1/currentMatches?apikey=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const text = await response.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(500).json({
        apiStatus: "failure",
        reason: "Invalid JSON from upstream API",
        raw: text,
        data: []
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        apiStatus: "failure",
        reason: `Upstream status ${response.status}`,
        upstream: json,
        data: []
      });
    }

    const matches = Array.isArray(json.data)
      ? json.data.map((match) => ({
          id: match.id || "",
          name: match.name || "Match",
          status: match.status || "No status",
          venue: match.venue || "Unknown venue",
          teams: Array.isArray(match.teams) ? match.teams : [],
          matchStarted: !!match.matchStarted,
          matchEnded: !!match.matchEnded
        }))
      : [];

    cache = {
      data: matches,
      timestamp: now
    };

    return res.status(200).json({
      apiStatus: "success",
      source: "api",
      count: matches.length,
      data: matches
    });
  } catch (err) {
    return res.status(500).json({
      apiStatus: "failure",
      reason: err.message || "fetch failed",
      name: err.name || "Error",
      apiUrl: url,
      data: []
    });
  }
}
