
let cache = {
  data: null,
  timestamp: 0
};

const CACHE_TIME = 2 * 60 * 1000;

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

  try {

    const response = await fetch(
      `https://api.cricketdata.org/v1/currentMatches?apikey=${API_KEY}&offset=0`
    );

    const json = await response.json();

    const matches = (json.data || []).map(match => ({
      id: match.id,
      name: match.name,
      status: match.status,
      venue: match.venue,
      teams: match.teams,
      matchStarted: match.matchStarted,
      matchEnded: match.matchEnded
    }));

    cache = {
      data: matches,
      timestamp: now
    };

    return res.status(200).json({
      apiStatus: "success",
      source: "api",
      data: matches
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      apiStatus: "failure",
      reason: "API fetch failed",
      data: []
    });

  }
}
