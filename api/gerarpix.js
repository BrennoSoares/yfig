export default async function handler(req, res) {

  const API_URL = 'https://www.pagamentos-seguros.app/api-pix/FWnY2Ki0B3ixWudFVmsTMIbwwUhS3rPIak2_nbcYArL2N9RbWrSvr7KeqOqX8vj0h8Zrn3kPk5Vr_hWxPna66w';

  // ── PARÂMETROS DA URL ──
  const nome   = req.query.name     ? decodeURIComponent(req.query.name)     : '';
  const cpfRaw = req.query.document ? decodeURIComponent(req.query.document) : '';

  if (!nome || !cpfRaw) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros obrigatórios: ?name=Nome&document=CPF',
      exemplo: '?name=Brenno%20Soares&document=01724315498'
    });
  }

  const cpf      = cpfRaw.replace(/\D/g, '');
  const pedidoId = Math.floor(Math.random() * 90000) + 10000;
  const valor    = 78.47;
  const centavos = Math.round(valor * 100); // 7847

  // ── BODY DUTTYFY ──
  const body = {
    amount: centavos,
    description: `Pedido #${pedidoId}`,
    customer: {
      name:     nome,
      document: cpf,
      email:    `cliente${pedidoId}@email.com`,
      phone:    '11999999999'
    },
    item: {
      title:    `Pedido #${pedidoId}`,
      price:    centavos,
      quantity: 1
    },
    paymentMethod: 'PIX',
    utm: ''
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Duttyfy retorna: { pixCode, transactionId, status }
    const pixCode       = data?.pixCode       ?? null;
    const transactionId = data?.transactionId ?? null;

    if (response.ok && pixCode) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(gerarHTML(nome, valor, pixCode, transactionId));
    } else {
      return res.status(response.status).json({
        success:      false,
        api_response: data,
        payload_sent: body
      });
    }

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function gerarHTML(nome, valor, pixCode, transactionId) {
  const primeiroNome = nome.split(' ')[0];
  const valorFmt     = 'R$ ' + valor.toFixed(2).replace('.', ',');
  const qrUrl        = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixCode)}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="theme-color" content="#d6127d">
  <title>Pagamento PIX · ${valorFmt}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --pink:    #d6127d;
      --pink-dk: #a50d60;
      --pink-lt: #fce7f3;
      --pink-md: #fbcfe8;
      --bg:      #fdf2f8;
      --bord:    #fce7f3;
      --bord2:   #fbcfe8;
      --text:    #1a0010;
      --muted:   #9d174d;
      --white:   #ffffff;
    }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      min-height: 100svh;
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .card {
      background: var(--white); border-radius: 28px;
      width: 100%; max-width: 420px;
      box-shadow: 0 8px 48px rgba(214,18,125,.15); overflow: hidden;
    }
    /* HEADER */
    .header {
      background: linear-gradient(135deg, #d6127d, #a50d60);
      padding: 30px 24px 40px; text-align: center;
      position: relative; overflow: hidden;
    }
    .header::before {
      content: ''; position: absolute; top: -60px; right: -60px;
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(255,255,255,.08);
    }
    .header::after {
      content: ''; position: absolute; bottom: -40px; left: -40px;
      width: 140px; height: 140px; border-radius: 50%;
      background: rgba(255,255,255,.06);
    }
    .header-icon { font-size: 36px; margin-bottom: 10px; position: relative; z-index: 1; }
    .header-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.7); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; position: relative; z-index: 1; }
    .header-valor { font-size: 46px; font-weight: 900; color: #fff; letter-spacing: -2px; line-height: 1; position: relative; z-index: 1; }
    .header-nome  { font-size: 14px; color: rgba(255,255,255,.85); margin-top: 10px; font-weight: 500; position: relative; z-index: 1; }
    .wave { display: block; margin-top: -2px; }
    /* BODY */
    .body { padding: 6px 22px 26px; }
    /* STEPS */
    .steps { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; gap: 4px; }
    .step  { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--pink-lt); color: var(--pink); font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid var(--pink-md); }
    .step-txt  { font-size: 10px; font-weight: 600; color: var(--muted); text-align: center; line-height: 1.4; }
    .step-line { flex: 1; height: 2px; background: var(--bord2); margin-top: 13px; border-radius: 99px; }
    /* QR */
    .qr-section { text-align: center; margin-bottom: 18px; }
    .qr-label   { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; }
    .qr-wrap    { display: inline-block; padding: 14px; background: #fff; border: 2px solid var(--bord2); border-radius: 20px; box-shadow: 0 4px 20px rgba(214,18,125,.12); position: relative; }
    .qr-wrap img { width: 178px; height: 178px; display: block; border-radius: 8px; }
    .qr-corner { position: absolute; width: 18px; height: 18px; border-color: var(--pink); border-style: solid; }
    .qr-corner.tl { top: 6px;    left: 6px;    border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
    .qr-corner.tr { top: 6px;    right: 6px;   border-width: 3px 3px 0 0; border-radius: 0 4px 0 0; }
    .qr-corner.bl { bottom: 6px; left: 6px;    border-width: 0 0 3px 3px; border-radius: 0 0 0 4px; }
    .qr-corner.br { bottom: 6px; right: 6px;   border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }
    /* TIMER */
    .timer-wrap { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 16px 0; background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 10px 14px; }
    .timer-txt   { font-size: 13px; font-weight: 600; color: #92400e; }
    .timer-count { font-weight: 800; color: #c2410c; font-size: 14px; font-variant-numeric: tabular-nums; }
    /* DIVIDER */
    .divider { display: flex; align-items: center; gap: 10px; margin: 14px 0; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1.5px; background: var(--bord2); border-radius: 99px; }
    /* CODE */
    .code-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .code-box   { display: flex; align-items: center; gap: 10px; background: var(--bg); border: 1.5px solid var(--bord2); border-radius: 14px; padding: 12px 14px; margin-bottom: 14px; }
    .code-text  { flex: 1; font-family: monospace; font-size: 10px; color: var(--text); word-break: break-all; line-height: 1.5; max-height: 54px; overflow: hidden; }
    /* BOTÃO */
    .btn-copy { width: 100%; background: linear-gradient(135deg, #d6127d, #a50d60); border: none; border-radius: 16px; padding: 16px; font-size: 15px; font-weight: 800; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(214,18,125,.4); transition: transform .15s, box-shadow .15s; font-family: 'Inter', sans-serif; }
    .btn-copy:hover  { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(214,18,125,.5); }
    .btn-copy:active { transform: scale(.97); }
    .btn-copy.copied { background: linear-gradient(135deg, #059669, #047857); box-shadow: 0 4px 20px rgba(5,150,105,.4); }
    /* STATUS */
    .status-wrap { display: flex; align-items: center; gap: 10px; background: var(--pink-lt); border: 1.5px solid var(--pink-md); border-radius: 12px; padding: 10px 14px; margin-top: 14px; }
    .status-dot  { width: 10px; height: 10px; border-radius: 50%; background: var(--pink); flex-shrink: 0; animation: pulse-dot 1.5s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100%{ box-shadow: 0 0 0 0 rgba(214,18,125,.5); } 50%{ box-shadow: 0 0 0 7px rgba(214,18,125,0); } }
    .status-txt { font-size: 13px; font-weight: 700; color: var(--pink-dk); }
    /* FOOTER */
    .footer { padding: 14px 22px; border-top: 1px solid var(--bord); display: flex; align-items: center; justify-content: center; gap: 6px; }
    .footer-txt  { font-size: 11px; color: #be185d; font-weight: 500; }
    .footer-logo { font-size: 12px; font-weight: 800; color: var(--pink); }
    /* SUCESSO */
    .sucesso-overlay { display: none; position: fixed; inset: 0; background: rgba(100,0,50,.6); z-index: 100; align-items: center; justify-content: center; padding: 16px; }
    @keyframes popUp { from{opacity:0;transform:scale(.86)} to{opacity:1;transform:scale(1)} }
    .sucesso-card { background: #fff; border-radius: 28px; padding: 40px 28px; text-align: center; max-width: 340px; width: 100%; box-shadow: 0 20px 60px rgba(214,18,125,.25); animation: popUp .45s cubic-bezier(.34,1.56,.64,1); border: 2px solid var(--pink-md); }
    .sucesso-icon  { font-size: 70px; margin-bottom: 14px; }
    .sucesso-title { font-size: 24px; font-weight: 900; color: var(--pink); margin-bottom: 8px; }
    .sucesso-sub   { font-size: 14px; color: #6b7280; line-height: 1.6; }
    @media(max-width:400px){ .header-valor{font-size:38px} .qr-wrap img{width:155px;height:155px} }
  </style>
</head>
<body>
<div class="card">

  <div class="header">
    <div class="header-icon">💳</div>
    <div class="header-label">Pagamento via PIX</div>
    <div class="header-valor">${valorFmt}</div>
    <div class="header-nome">Olá, ${primeiroNome}! Pague agora e confirme na hora 💜</div>
  </div>

  <svg class="wave" viewBox="0 0 420 36" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width:100%;display:block;margin-top:-1px">
    <path d="M0,18 C80,36 160,0 240,18 C320,36 380,8 420,18 L420,0 L0,0 Z" fill="#a50d60"/>
    <path d="M0,22 C70,4 150,38 230,18 C310,-2 370,30 420,20 L420,0 L0,0 Z" fill="#d6127d"/>
  </svg>

  <div class="body">

    <div class="steps">
      <div class="step"><div class="step-num">1</div><div class="step-txt">Abra o app do banco</div></div>
      <div class="step-line"></div>
      <div class="step"><div class="step-num">2</div><div class="step-txt">Escaneie ou copie o código</div></div>
      <div class="step-line"></div>
      <div class="step"><div class="step-num">3</div><div class="step-txt">Confirme o pagamento</div></div>
    </div>

    <div class="qr-section">
      <div class="qr-label">📱 Escaneie com a câmera</div>
      <div class="qr-wrap">
        <div class="qr-corner tl"></div><div class="qr-corner tr"></div>
        <div class="qr-corner bl"></div><div class="qr-corner br"></div>
        <img src="${qrUrl}" alt="QR Code PIX">
      </div>
    </div>

    <div class="timer-wrap">
      <span style="font-size:16px">⏱</span>
      <span class="timer-txt">PIX expira em <span class="timer-count" id="timer">30:00</span></span>
    </div>

    <div class="divider">ou use o código abaixo</div>

    <div class="code-label">📋 Copia e Cola</div>
    <div class="code-box">
      <div class="code-text">${pixCode.substring(0, 130)}...</div>
    </div>

    <button class="btn-copy" id="btn-copy" onclick="copiarPix()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span id="btn-txt">Copiar Código PIX</span>
    </button>

    <div class="status-wrap">
      <div class="status-dot"></div>
      <div class="status-txt" id="status-txt">Aguardando seu pagamento...</div>
    </div>

  </div>

  <div class="footer">
    <span class="footer-txt">Pagamento seguro processado por</span>
    <span class="footer-logo">Duttyfy 🔒</span>
  </div>

</div>

<!-- SUCESSO -->
<div class="sucesso-overlay" id="sucesso-overlay">
  <div class="sucesso-card">
    <div class="sucesso-icon">🎉</div>
    <div class="sucesso-title">Pago com sucesso!</div>
    <div class="sucesso-sub">Seu pagamento de <strong style="color:#d6127d">${valorFmt}</strong> foi confirmado. Obrigado, ${primeiroNome}!</div>
  </div>
</div>

<script>
const PIX_CODE       = ${JSON.stringify(pixCode)};
const TRANSACTION_ID = ${JSON.stringify(transactionId)};
const API_URL        = ${JSON.stringify('https://www.pagamentos-seguros.app/api-pix/FWnY2Ki0B3ixWudFVmsTMIbwwUhS3rPIak2_nbcYArL2N9RbWrSvr7KeqOqX8vj0h8Zrn3kPk5Vr_hWxPna66w')};
let pago = false;

async function copiarPix() {
  try { await navigator.clipboard.writeText(PIX_CODE); }
  catch {
    const t = document.createElement('textarea');
    t.value = PIX_CODE; document.body.appendChild(t);
    t.select(); document.execCommand('copy'); document.body.removeChild(t);
  }
  const btn = document.getElementById('btn-copy');
  const txt = document.getElementById('btn-txt');
  btn.classList.add('copied');
  txt.textContent = '✅ Código copiado!';
  setTimeout(() => { btn.classList.remove('copied'); txt.textContent = 'Copiar Código PIX'; }, 3000);
}

// Timer 30 min
let totalSec = 30 * 60;
const timerEl = document.getElementById('timer');
const timerInterval = setInterval(() => {
  if (pago) { clearInterval(timerInterval); return; }
  totalSec--;
  if (totalSec <= 0) { timerEl.textContent = '00:00'; clearInterval(timerInterval); return; }
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  timerEl.textContent = m + ':' + s;
}, 1000);

// Polling Duttyfy — GET ?transactionId=ID
async function verificarPagamento() {
  if (pago || !TRANSACTION_ID) return;
  try {
    const r = await fetch(API_URL + '?transactionId=' + TRANSACTION_ID);
    const d = await r.json();
    if (d.status === 'COMPLETED') {
      pago = true;
      clearInterval(timerInterval);
      clearInterval(checkInterval);
      document.getElementById('status-txt').textContent = '✅ Pagamento confirmado!';
      document.getElementById('sucesso-overlay').style.display = 'flex';
    }
  } catch {}
}
const checkInterval = setInterval(verificarPagamento, 4000);
</script>
</body>
</html>`;
}
