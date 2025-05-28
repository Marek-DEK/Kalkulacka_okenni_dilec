export async function handler(event, context) {
  const params = event.queryStringParameters;
  const urlParams = new URLSearchParams(params).toString();
  const url = `https://script.google.com/macros/s/AKfycbwIRew3ybi6wCotjr7kYxHvf3axTSfiKZ1KGgSr9j5lPl5_zKt8SJhYC2XmMcUiiBo0/exec?${urlParams}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error', detail: error.toString() }),
    };
  }
}
