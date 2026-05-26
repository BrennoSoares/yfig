export default async function handler(req, res) {
  const clientId     = 'gw_8ezgUtDKjvajtPvzRyDLlvNS6qJYgyuc';
  const clientSecret = 'sfonYlucrS5UPeLQuCQaOGYJgx0rtaZHxV2nYRZC0XQgnWE6mLhgAkS8dYa8OkNA';

  const nome   = req.query.name     ? decodeURIComponent(req.query.name)     : '';
  const cpfRaw = req.query.document ? decodeURIComponent(req.query.document) : '';

  if (!nome || !cpfRaw) {
    return res.status(400).json({ success: false, message: 'Parâmetros: ?name=Nome&document=CPF' });
  }

  const cpf       = cpfRaw.replace(/\D/g, '');
  const pedidoId  = Math.floor(Math.random() * 90000) + 10000;
  const valor     = 78.47; // VALOR FIXO

  const body = {
    nome,
    cpf,
    valor,
    descricao: `Pedido #${pedidoId}`,
    postback: `https://${req.headers.host}/api/webhook`
  };

  try {
    const response = await fetch('https://api.gothampaybr.com/api/v1/pix/cashin', {
      method: 'POST',
      headers: {
        'X-Client-Id':     clientId,
        'X-Client-Secret': clientSecret,
        'Content-Type':    'application/json',
        'Accept':          'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const pixCode = data?.qr_code_text ?? data?.data?.qr_code_text ?? null;
    const pixId   = data?.id           ?? data?.data?.id           ?? null;

    if (response.ok && pixCode) {
      // Retorna HTML bonito
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(gerarHTML(nome, valor, pixCode, pixId, pedidoId));
    } else {
      return res.status(response.status).json({ success: false, api_response: data });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

function gerarHTML(nome, valor, pixCode, pixId, pedidoId) {
  const primeiroNome = nome.split(' ')[0];
  const valorFmt = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixCode)}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="theme-color" content="#00875a">
  <title>Pagamento PIX · R$ ${valor.toFixed(2).replace('.', ',')}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --green:    #00875a;
      --green-dk: #005c3d;
      --green-lt: #e6f7f1;
      --gray:     #f4f6f8;
      --border:   #e8ecf0;
      --text:     #1a1f36;
      --muted:    #6b7280;
      --white:    #ffffff;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--gray);
      min-height: 100svh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    /* ── CARD ── */
    .card {
      background: var(--white);
      border-radius: 24px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 8px 48px rgba(0,0,0,.10);
      overflow: hidden;
    }

    /* ── HEADER ── */
    .header {
      background: linear-gradient(135deg, var(--green), var(--green-dk));
      padding: 28px 24px 32px;
      text-align: center;
      position: relative;
    }
    .header-logo {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .header-title {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,.75);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
    }
    .header-valor {
      font-size: 42px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -1px;
    }
    .header-nome {
      font-size: 14px;
      color: rgba(255,255,255,.8);
      margin-top: 6px;
      font-weight: 500;
    }

    /* ── WAVE ── */
    .wave {
      display: block;
      margin-top: -2px;
    }

    /* ── BODY ── */
    .body {
      padding: 8px 24px 28px;
    }

    /* ── STEPS ── */
    .steps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 8px;
    }
    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }
    .step-num {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: var(--green-lt);
      color: var(--green);
      font-size: 12px;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .step-txt {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      text-align: center;
      line-height: 1.35;
    }
    .step-line {
      flex: 1;
      height: 1px;
      background: var(--border);
      margin-top: 13px;
    }

    /* ── QR CODE ── */
    .qr-section {
      text-align: center;
      margin-bottom: 20px;
    }
    .qr-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .qr-wrap {
      display: inline-block;
      padding: 12px;
      background: var(--white);
      border: 2px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,.06);
      position: relative;
    }
    .qr-wrap img {
      width: 180px; height: 180px;
      display: block;
      border-radius: 8px;
    }
    .qr-corners::before, .qr-corners::after {
      content: '';
      position: absolute;
      width: 20px; height: 20px;
      border-color: var(--green);
      border-style: solid;
    }
    .qr-corners::before { top: 6px; left: 6px; border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
    .qr-corners::after  { bottom: 6px; right: 6px; border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }

    /* ── DIVIDER ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 16px 0;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* ── CODE BOX ── */
    .code-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .code-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--gray);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .code-text {
      flex: 1;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: var(--text);
      word-break: break-all;
      line-height: 1.5;
      max-height: 58px;
      overflow: hidden;
    }

    /* ── BOTÕES ── */
    .btn-copy {
      width: 100%;
      background: linear-gradient(135deg, var(--green), var(--green-dk));
      border: none;
      border-radius: 14px;
      padding: 16px;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0,135,90,.35);
      transition: transform .15s, box-shadow .15s;
      font-family: 'Inter', sans-serif;
    }
    .btn-copy:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,135,90,.45); }
    .btn-copy:active { transform: scale(.97); }
    .btn-copy.copied {
      background: linear-gradient(135deg, #059669, #047857);
    }

    /* ── TIMER ── */
    .timer-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 16px 0;
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-radius: 10px;
      padding: 10px 14px;
    }
    .timer-icon { font-size: 16px; }
    .timer-txt { font-size: 13px; font-weight: 600; color: #92400e; }
    .timer-count { font-weight: 800; color: #b45309; font-size: 14px; }

    /* ── STATUS ── */
    .status-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--green-lt);
      border: 1.5px solid #a7f3d0;
      border-radius: 10px;
      padding: 10px 14px;
      margin-top: 14px;
    }
    .status-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--green);
      flex-shrink: 0;
      animation: pulse-dot 1.5s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,135,90,.5); }
      50%       { box-shadow: 0 0 0 6px rgba(0,135,90,0); }
    }
    .status-txt { font-size: 13px; font-weight: 600; color: var(--green-dk); }

    /* ── FOOTER ── */
    .footer {
      padding: 14px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .footer-txt { font-size: 11px; color: var(--muted); font-weight: 500; }
    .footer-logo { font-size: 13px; font-weight: 700; color: var(--green); }

    /* ── SUCESSO ── */
    .sucesso-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn .3s;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes popUp  { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
    .sucesso-card {
      background: #fff;
      border-radius: 24px;
      padding: 36px 28px;
      text-align: center;
      max-width: 340px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,.2);
      animation: popUp .4s cubic-bezier(.34,1.56,.64,1);
    }
    .sucesso-icon { font-size: 64px; margin-bottom: 12px; }
    .sucesso-title { font-size: 22px; font-weight: 800; color: var(--green); margin-bottom: 6px; }
    .sucesso-sub { font-size: 14px; color: var(--muted); line-height: 1.5; }

    @media (max-width: 400px) {
      .header-valor { font-size: 36px; }
      .qr-wrap img { width: 150px; height: 150px; }
    }
  </style>
</head>
<body>

<div class="card">

  <!-- HEADER -->
  <div class="header">
    <div class="header-logo">💳</div>
    <div class="header-title">Pagamento via PIX</div>
    <div class="header-valor">R$ ${valor.toFixed(2).replace('.', ',')}</div>
    <div class="header-nome">Olá, ${primeiroNome}! Escaneie o QR Code abaixo 👇</div>
  </div>

  <svg class="wave" viewBox="0 0 420 32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width:100%;display:block;margin-top:-1px">
    <path d="M0,16 C70,32 140,0 210,16 C280,32 350,0 420,16 L420,0 L0,0 Z" fill="#005c3d"/>
    <path d="M0,20 C80,4 160,36 240,16 C320,-4 370,28 420,18 L420,0 L0,0 Z" fill="#00875a"/>
  </svg>

  <div class="body">

    <!-- STEPS -->
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-txt">Abra o app do banco</div>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-txt">Escaneie ou copie o código</div>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-txt">Confirme o pagamento</div>
      </div>
    </div>

    <!-- QR CODE -->
    <div class="qr-section">
      <div class="qr-label">📱 Escaneie com a câmera do celular</div>
      <div class="qr-wrap qr-corners">
        <img src="${qrUrl}" alt="QR Code PIX" id="qr-img">
      </div>
    </div>

    <!-- TIMER -->
    <div class="timer-wrap">
      <span class="timer-icon">⏱</span>
      <span class="timer-txt">PIX expira em <span class="timer-count" id="timer">30:00</span></span>
    </div>

    <div class="divider">ou copie o código abaixo</div>

    <!-- CODE -->
    <div class="code-label">📋 Copia e Cola</div>
    <div class="code-box">
      <div class="code-text" id="pix-code">${pixCode.substring(0, 120)}...</div>
    </div>

    <!-- BOTÃO COPIAR -->
    <button class="btn-copy" id="btn-copy" onclick="copiarPix()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span id="btn-txt">Copiar Código PIX</span>
    </button>

    <!-- STATUS -->
    <div class="status-wrap">
      <div class="status-dot"></div>
      <div class="status-txt" id="status-txt">Aguardando seu pagamento...</div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span class="footer-txt">Pagamento seguro processado por</span>
    <span class="footer-logo">GothamPay</span>
    <span style="font-size:14px">🔒</span>
  </div>

</div>

<!-- SUCESSO -->
<div class="sucesso-overlay" id="sucesso-overlay">
  <div class="sucesso-card">
    <div class="sucesso-icon">✅</div>
    <div class="sucesso-title">Pagamento Confirmado!</div>
    <div class="sucesso-sub">Seu pagamento de <strong>R$ ${valor.toFixed(2).replace('.', ',')}</strong> foi recebido com sucesso. Obrigado, ${primeiroNome}!</div>
  </div>
</div>

<script>
const PIX_CODE   = ${JSON.stringify(pixCode)};
const PIX_ID     = ${JSON.stringify(pixId)};
let   copiado    = false;
let   pago       = false;

// ── COPIAR PIX ──
async function copiarPix() {
  try { await navigator.clipboard.writeText(PIX_CODE); }
  catch {
    const t = document.createElement('textarea');
    t.value = PIX_CODE;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
  }
  const btn = document.getElementById('btn-copy');
  const txt = document.getElementById('btn-txt');
  btn.classList.add('copied');
  txt.textContent = '✅ Código copiado!';
  copiado = true;
  setTimeout(() => { btn.classList.remove('copied'); txt.textContent = 'Copiar Código PIX'; }, 3000);
}

// ── TIMER 30 MIN ──
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

// ── VERIFICAR PAGAMENTO ──
async function verificarPagamento() {
  if (pago || !PIX_ID) return;
  try {
    const r = await fetch('/api/verificar?id=' + PIX_ID);
    const d = await r.json();
    if (d.status === 'PAID' || d.status === 'APPROVED' || d.status === 'paid') {
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
