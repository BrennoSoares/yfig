export default async function handler(req, res) {
  const API_URL = 'https://www.pagamentos-seguros.app/api-pix/FWnY2Ki0B3ixWudFVmsTMIbwwUhS3rPIak2_nbcYArL2N9RbWrSvr7KeqOqX8vj0h8Zrn3kPk5Vr_hWxPna66w';

  const { transactionId } = req.query;
  if (!transactionId) return res.status(400).json({ success: false, message: 'transactionId ausente' });

  try {
    const r = await fetch(`${API_URL}?transactionId=${transactionId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await r.json();
    // Duttyfy retorna: { status: "PENDING" | "COMPLETED", paidAt? }
    return res.status(200).json({ success: true, status: data.status ?? 'PENDING', paidAt: data.paidAt ?? null });
  } catch (err) {
    return res.status(200).json({ success: true, status: 'PENDING' });
  }
}
