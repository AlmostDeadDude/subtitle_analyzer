<?php
// Simple proxy to keep the API key server-side
header('Content-Type: application/json');

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
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postFields,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,
    CURLOPT_FOLLOWLOCATION => true,
]);

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    echo json_encode(['status' => 'error', 'message' => 'Upstream request failed']);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$body = substr($response, $headerSize);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $body;
