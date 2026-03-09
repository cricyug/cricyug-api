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

  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;

  try {

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const json = await response.json();

    // API failure (rate limit etc.)
    if (json?.status === "failure") {
      return res.status(200).json({
        apiStatus: "failure",
        reason: json?.reason || "API failure",
        data: []
      });
    }

    const matches = Array.isArray(json?.data) ? json.data : [];

    return res.status(200).json({
      apiStatus: "success",
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
