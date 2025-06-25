<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get the raw POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validate required fields
    if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email']) || !isset($data['message'])) {
        throw new Exception('Missing required fields');
    }
    
    // Sanitize the data
    $firstName = htmlspecialchars(trim($data['firstName']));
    $lastName = htmlspecialchars(trim($data['lastName']));
    $email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($data['message']));
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }
    
    // Create timestamp
    $timestamp = date('Y-m-d H:i:s');
    
    // Create message content
    $messageContent = "
=== NEW MESSAGE FROM WEBSITE ===
Date: {$timestamp}
Name: {$firstName} {$lastName}
Email: {$email}
Message:
{$message}
================================

";
    
    // Save to file
    $filename = 'user_messages.txt';
    $result = file_put_contents($filename, $messageContent, FILE_APPEND | LOCK_EX);
    
    if ($result === false) {
        throw new Exception('Failed to save message');
    }
    
    // Send success response
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for sharing your heart with us! 💜 Your message has been received with love and will be personally reviewed.',
        'timestamp' => $timestamp
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?> 