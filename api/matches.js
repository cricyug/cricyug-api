export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {

    const API_KEY = process.env.CRICKETDATA_API_KEY;

    const response = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`
    );

    const data = await response.json();

    res.status(200).json(data.data || []);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
