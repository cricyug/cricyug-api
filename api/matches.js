
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
      matchEnded: match.matchEnded,
      date: match.date,
      matchType: match.matchType,
      score: match.score
    }));

    return res.status(200).json({
      apiStatus: "success",
      data: matches
    });

  } catch (err) {

    return res.status(500).json({
      apiStatus: "failure",
      reason: "API fetch failed",
      data: []
    });

  }
}
