export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const payload = req.body;

  // Responde 2xx rápido (< 5s) para evitar retries
  res.status(200).json({ ok: true });

  // Duttyfy envia status PENDING (geração) ou COMPLETED (pago)
  const status        = payload?.status;
  const transactionId = payload?.transactionId ?? payload?._id?.$oid;
  const amount        = payload?.amount; // em centavos
  const customer      = payload?.customer;

  if (status === 'COMPLETED') {
    // ✅ PAGAMENTO CONFIRMADO
    // Processe aqui: liberar acesso, enviar email, etc.
    // Implemente idempotência: processe COMPLETED apenas 1x por transactionId
    console.log(`[PAGO] transactionId: ${transactionId} | valor: R$ ${(amount/100).toFixed(2)} | cliente: ${customer?.name}`);
  }

  if (status === 'PENDING') {
    // PIX gerado — aguardando pagamento
    console.log(`[PENDENTE] transactionId: ${transactionId}`);
  }
}
