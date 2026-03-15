<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot check
if (!empty($_POST['_gotcha'])) {
    echo json_encode(['success' => true]); // silently discard spam
    exit;
}

// Sanitize inputs
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$firstName = clean($_POST['firstName'] ?? '');
$lastName  = clean($_POST['lastName']  ?? '');
$company   = clean($_POST['company']   ?? '');
$phone     = clean($_POST['phone']     ?? '');
$email     = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$subject   = clean($_POST['subject']   ?? 'General Inquiry');
$message   = clean($_POST['message']   ?? '');

// Validate required fields
if (!$firstName || !$lastName || !$company || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

// Email destination
$to      = 'zqiao02@gmail.com';
$subjectLine = "BioChem Website Contact: {$subject}";

$body = "You received a new message from the BioChem Technology website.\n\n";
$body .= "Name:    {$firstName} {$lastName}\n";
$body .= "Company: {$company}\n";
$body .= "Phone:   " . ($phone ?: 'N/A') . "\n";
$body .= "Email:   {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$headers  = "From: no-reply@biochemtech.com\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = mail($to, $subjectLine, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Mail server error']);
}
