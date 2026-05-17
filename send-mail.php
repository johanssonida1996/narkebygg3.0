<?php

function redirect_with_status($status)
{
    header('Location: index.html?form=' . rawurlencode($status) . '#kontakt');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_status('error');
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirect_with_status('invalid');
}

$to = 'info@narkebygg.se';
$from = 'ida@narkebygg.se';
$subject = 'Förfrågan från narkebygg.se';

$body =
    "Nytt meddelande från kontaktformuläret på narkebygg.se\n\n" .
    "Namn: $name\n" .
    "E-post: $email\n" .
    "Telefon: $phone\n\n" .
    "Beskrivning av projekt:\n$message";

$headers =
    "MIME-Version: 1.0\r\n" .
    "Content-Type: text/plain; charset=UTF-8\r\n" .
    "From: Närke Bygg <$from>\r\n" .
    "Reply-To: $email\r\n";

$sent = mail($to, $subject, $body, $headers);

if (!$sent) {
    redirect_with_status('error');
}

redirect_with_status('success');