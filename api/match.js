let cache = new Map();

const CACHE_TIME = 2 * 60 * 1000; // 2 minutes

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const API_KEY = process.env.CRICKETDATA_API_KEY;
    const id = req.query?.id;

    if (!API_KEY) {
      return res.status(500).json({
        apiStatus: "failure",
        reason: "API key missing",
        data: null
      });
    }

    if (!id) {
      return res.status(400).json({
        apiStatus: "failure",
        reason: "Match ID is required",
        data: null
      });
    }

    const now = Date.now();
    const cached = cache.get(id);

    if (cached && now - cached.timestamp < CACHE_TIME) {
      return res.status(200).json({
        apiStatus: "success",
        source: "cache",
        data: cached.data
      });
    }

    const url = `https://api.cricapi.com/v1/match_info?apikey=${API_KEY}&id=${encodeURIComponent(id)}`;

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
        data: null
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        apiStatus: "failure",
        reason: `Upstream status ${response.status}`,
        upstream: json,
        data: null
      });
    }

    if (json.status && json.status !== "success") {
      return res.status(500).json({
        apiStatus: "failure",
        reason: json.reason || "Upstream returned failure",
        upstream: json,
        data: null
      });
    }

    const match = json?.data || null;

    if (!match) {
      return res.status(404).json({
        apiStatus: "failure",
        reason: "Match not found",
        data: null
      });
    }

    const cleanedMatch = {
      id: match.id || "",
      name: match.name || "Match",
      status: match.status || "No status",
      venue: match.venue || "Unknown venue",
      teams: Array.isArray(match.teams) ? match.teams : [],
      matchStarted: Boolean(match.matchStarted),
      matchEnded: Boolean(match.matchEnded),
      date: match.date || "",
      dateTimeGMT: match.dateTimeGMT || "",
      matchType: match.matchType || "",
      teamInfo: Array.isArray(match.teamInfo) ? match.teamInfo : [],
      score: Array.isArray(match.score) ? match.score : [],
      series_id: match.series_id || "",
      series_name: match.series_name || "",
      fantasyEnabled: Boolean(match.fantasyEnabled),
      bbbEnabled: Boolean(match.bbbEnabled),
      hasSquad: Boolean(match.hasSquad)
    };

    cache.set(id, {
      data: cleanedMatch,
      timestamp: now
    });

    return res.status(200).json({
      apiStatus: "success",
      source: "api",
      data: cleanedMatch
    });
  } catch (err) {
    console.error("MATCH API CRASH:", err);

    return res.status(500).json({
      apiStatus: "failure",
      reason: err?.message || "Server crash",
      name: err?.name || "Error",
      data: null
    });
  }
}
