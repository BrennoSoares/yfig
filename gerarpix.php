<?php


ini_set('display_errors', 0);
error_reporting(E_ALL);

// ── CREDENCIAIS ──
$clientId     = 'gw_8ezgUtDKjvajtPvzRyDLlvNS6qJYgyuc';
$clientSecret = 'sfonYlucrS5UPeLQuCQaOGYJgx0rtaZHxV2nYRZC0XQgnWE6mLhgAkS8dYa8OkNA';

// ── RECEBE PARÂMETROS DA URL ──
$nome     = isset($_GET['name'])     ? trim(urldecode($_GET['name']))     : '';
$cpf_raw  = isset($_GET['document']) ? trim(urldecode($_GET['document'])) : '';

// Valida os parâmetros obrigatórios
if (empty($nome) || empty($cpf_raw)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Parâmetros obrigatórios: ?name=Nome&document=CPF',
        'exemplo' => '?name=Brenno%20Soares&document=01724315498'
    ]);
    exit;
}

// Limpa CPF (remove pontos, traços etc)
$cpf = preg_replace('/\D/', '', $cpf_raw);

// ── DADOS ALEATÓRIOS ──
$pedidoId   = rand(10000, 99999);
$valor      = round(rand(7847) / 100, 2); // valor aleatório entre R$ 19,90 e R$ 499,90

$descricoes = [
    "Pedido #{$pedidoId} - Delivery",
    "Compra #{$pedidoId}",
    "Pedido Online #{$pedidoId}",
    "Pagamento #{$pedidoId}",
    "Delivery #{$pedidoId}",
];
$descricao = $descricoes[array_rand($descricoes)];

// ── MONTA O BODY DA API ──
$body = [
    'nome'      => $nome,
    'cpf'       => $cpf,
    'valor'     => $valor,
    'descricao' => $descricao,
    'postback'  => 'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/webhook.php'
];

// ── CHAMA A API GOTHAMPA Y ──
$ch = curl_init('https://api.gothampaybr.com/api/v1/pix/cashin');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'X-Client-Id: '     . trim($clientId),
        'X-Client-Secret: ' . trim($clientSecret),
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode($body),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 30,
]);

$responseRaw = curl_exec($ch);
$httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError   = curl_error($ch);
curl_close($ch);

header('Content-Type: application/json');

if ($httpCode === 200 || $httpCode === 201) {
    $data = json_decode($responseRaw, true);

    echo json_encode([
        'success'    => true,
        'pedido_id'  => $pedidoId,
        'nome'       => $nome,
        'cpf'        => $cpf,
        'valor'      => $valor,
        'descricao'  => $descricao,
        'pix'        => [
            'id'            => $data['id']           ?? $data['data']['id']           ?? null,
            'qr_code'       => $data['qr_code']      ?? $data['data']['qr_code']      ?? null,
            'qr_code_text'  => $data['qr_code_text'] ?? $data['data']['qr_code_text'] ?? null,
            'status'        => $data['status']        ?? $data['data']['status']       ?? null,
        ],
        'raw' => $data,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} else {
    echo json_encode([
        'success'      => false,
        'http_code'    => $httpCode,
        'curl_error'   => $curlError,
        'payload_sent' => $body,
        'api_response' => json_decode($responseRaw, true),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
exit;
