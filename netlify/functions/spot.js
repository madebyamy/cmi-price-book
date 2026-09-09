exports.handler = async () => {
  try {
    // goldprice.org public data feed — no key required
    const res = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) throw new Error(`goldprice ${res.status}`);
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) throw new Error('no data');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gold:      item.xauPrice,
        silver:    item.xagPrice,
        platinum:  item.xptPrice,
        palladium: item.xpdPrice,
      }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
