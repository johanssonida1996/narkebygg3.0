<?php
declare(strict_types=1);

function redirect_with_status(string $status): never
{
    header('Location: index.html?form=' . rawurlencode($status) . '#kontakt');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_status('error');
}

$honeypot = trim((string)($_POST['company'] ?? ''));
if ($honeypot !== '') {
    redirect_with_status('success');
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$source = trim((string)($_POST['form_source'] ?? 'Kontaktformulär'));

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirect_with_status('invalid');
}

$to = 'ida@narkebygg.se';
$subject = 'Förfrågan från narkebygg.se';
$safeName = preg_replace('/[\r\n]+/', ' ', $name) ?: 'Besökare';
$safeEmail = preg_replace('/[\r\n]+/', '', $email) ?: '';
$safePhone = preg_replace('/[\r\n]+/', ' ', $phone) ?: '-';

$bodyLines = [
    'Nytt meddelande från kontaktformuläret på narkebygg.se',
    '',
    'Källa: ' . $source,
    'Namn: ' . $safeName,
    'E-post: ' . $safeEmail,
    'Telefon: ' . $safePhone,
    '',
    'Beskrivning av projekt:',
    $message,
];

$body = implode(PHP_EOL, $bodyLines);

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Närke Bygg <info@narkebygg.se>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    redirect_with_status('error');
}

redirect_with_status('success');
