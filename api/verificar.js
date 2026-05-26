export default async function handler(req, res) {
  const clientId     = 'gw_8ezgUtDKjvajtPvzRyDLlvNS6qJYgyuc';
  const clientSecret = 'sfonYlucrS5UPeLQuCQaOGYJgx0rtaZHxV2nYRZC0XQgnWE6mLhgAkS8dYa8OkNA';

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'ID ausente' });

  try {
    const r = await fetch(`https://api.gothampaybr.com/api/v1/pix/cashin/status/${id}`, {
      headers: {
        'X-Client-Id':     clientId,
        'X-Client-Secret': clientSecret,
        'Content-Type':    'application/json',
      }
    });
    const data = await r.json();
    const status = data?.status ?? data?.data?.status ?? 'PENDING';
    return res.status(200).json({ success: true, status });
  } catch (err) {
    return res.status(200).json({ success: true, status: 'PENDING' });
  }
}
