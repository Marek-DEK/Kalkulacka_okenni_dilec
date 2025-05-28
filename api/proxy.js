export default async function handler(req, res) {
  const { method, query } = req;
  const params = new URLSearchParams(query).toString();
  const url = `https://script.google.com/macros/s/AKfycbwIRew3ybi6wCotjr7kYxHvf3axTSfiKZ1KGgSr9j5lPl5_zKt8SJhYC2XmMcUiiBo0/exec?${params}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', detail: error.toString() });
  }
}
