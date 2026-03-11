export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      apiStatus: "failure",
      reason: "Match id missing"
    });
  }

  const API_KEY = process.env.CRICKETDATA_API_KEY;

  try {

    const response = await fetch(
      `https://api.cricketdata.org/v1/match_info?apikey=${API_KEY}&id=${id}`
    );

    const json = await response.json();

    return res.status(200).json({
      apiStatus: "success",
      data: json.data
    });

  } catch (err) {

    return res.status(500).json({
      apiStatus: "failure",
      reason: "API fetch failed"
    });

  }

}
