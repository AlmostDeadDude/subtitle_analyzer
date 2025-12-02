<?php
// Simple proxy to keep the API key server-side
header('Content-Type: application/json');

if (!extension_loaded('curl')) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'cURL extension not available on server']);
    exit;
}

$apiKey = getenv('SUBTITLE_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'API key not configured']);
    exit;
}

if (!isset($_FILES['file']) || !isset($_POST['lang'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing file or language']);
    exit;
}

$file = $_FILES['file'];
$lang = $_POST['lang'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'File upload failed']);
    exit;
}

$postFields = [
    'file'      => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
    'lang'      => $lang,
    'X-API-Key' => $apiKey,
];

$ch = curl_init('https://almostdeaddude.pythonanywhere.com/');
$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if (!$origin && isset($_SERVER['HTTP_HOST'])) {
    // Fallback to current host as origin if none was sent by the client
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $origin = $scheme . '://' . $_SERVER['HTTP_HOST'];
}
$forwardHeaders = [];
if ($origin) {
    $forwardHeaders[] = 'Origin: ' . $origin;
}
$forwardHeaders[] = 'Accept: application/json';

curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postFields,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_HTTPHEADER     => $forwardHeaders,
]);

$response = curl_exec($ch);
if ($response === false) {
    $err = curl_error($ch);
    http_response_code(502);
    echo json_encode(['status' => 'error', 'message' => 'Upstream request failed', 'detail' => $err]);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$body = substr($response, $headerSize);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// If upstream did not return JSON, wrap a clearer error to avoid dumping HTML
$decoded = json_decode($body, true);
if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code($httpCode >= 400 ? $httpCode : 502);
    echo json_encode([
        'status'     => 'error',
        'message'    => 'Upstream returned non-JSON response',
        'http_code'  => $httpCode,
        'body_preview' => substr(strip_tags($body), 0, 300),
    ]);
    exit;
}

http_response_code($httpCode);
echo $body;
