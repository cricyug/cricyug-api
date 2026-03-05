export default async function handler(req, res) {

  const API_KEY = "demo";

  const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;

  try {

    const response = await fetch(url);
    const json = await response.json();

    const matches = Array.isArray(json?.data) ? json.data : [];

    res.status(200).json({
      data: matches
    });

  } catch (error) {

    res.status(500).json({
      data: [],
      error: "Failed to fetch matches"
    });

  }

}
