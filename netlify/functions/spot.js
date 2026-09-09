const TOKEN = 'c9ed1243-5375-4f2b-bb2e-dae05b3ea13f';

exports.handler = async () => {
  try {
    const res = await fetch(
      `https://api.nfusionsolutions.biz/api/v1/Metals/spot?token=${TOKEN}&currency=USD&format=json`
    );
    if (!res.ok) throw new Error(`nFusion ${res.status}`);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
