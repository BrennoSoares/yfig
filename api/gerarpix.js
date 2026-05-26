export default async function handler(req, res) {

  // ── CREDENCIAIS ──
  const clientId     = 'gw_8ezgUtDKjvajtPvzRyDLlvNS6qJYgyuc';
  const clientSecret = 'sfonYlucrS5UPeLQuCQaOGYJgx0rtaZHxV2nYRZC0XQgnWE6mLhgAkS8dYa8OkNA';

  // ── PARÂMETROS DA URL ──
  const nome    = req.query.name     ? decodeURIComponent(req.query.name)     : '';
  const cpfRaw  = req.query.document ? decodeURIComponent(req.query.document) : '';

  if (!nome || !cpfRaw) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros obrigatórios: ?name=Nome&document=CPF',
      exemplo:  '?name=Brenno%20Soares&document=01724315498'
    });
  }

  // Limpa CPF
  const cpf = cpfRaw.replace(/\D/g, '');

  // ── DADOS ALEATÓRIOS ──
  const pedidoId  = Math.floor(Math.random() * 90000) + 10000;
  const valor     = parseFloat((Math.random() * (499.90 - 19.90) + 19.90).toFixed(2));
  const descricoes = [
    `Pedido #${pedidoId} - Delivery`,
    `Compra #${pedidoId}`,
    `Pedido Online #${pedidoId}`,
    `Pagamento #${pedidoId}`,
    `Delivery #${pedidoId}`,
  ];
  const descricao = descricoes[Math.floor(Math.random() * descricoes.length)];

  // ── BODY DA API ──
  const body = {
    nome,
    cpf,
    valor,
    descricao,
    postback: `https://${req.headers.host}/api/webhook`
  };

  // ── CHAMA GOTHAMPA Y ──
  try {
    const response = await fetch('https://api.gothampaybr.com/api/v1/pix/cashin', {
      method:  'POST',
      headers: {
        'X-Client-Id':     clientId,
        'X-Client-Secret': clientSecret,
        'Content-Type':    'application/json',
        'Accept':          'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success:    true,
        pedido_id:  pedidoId,
        nome,
        cpf,
        valor,
        descricao,
        pix: {
          id:           data?.id           ?? data?.data?.id           ?? null,
          qr_code:      data?.qr_code      ?? data?.data?.qr_code      ?? null,
          qr_code_text: data?.qr_code_text ?? data?.data?.qr_code_text ?? null,
          status:       data?.status       ?? data?.data?.status       ?? null,
        },
        raw: data,
      });
    } else {
      return res.status(response.status).json({
        success:       false,
        http_code:     response.status,
        payload_sent:  body,
        api_response:  data,
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao conectar com a API GothamPay',
      error:   err.message,
    });
  }
}
