<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the JSON data
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    // Log the received data for debugging
    error_log('Received data: ' . $rawInput);
    
    if ($input && isset($input['email']) && isset($input['profession']) && isset($input['downloadType'])) {
        $timestamp = date('Y-m-d H:i:s');
        $email = $input['email'];
        $profession = $input['profession'];
        $downloadType = $input['downloadType'];
        
        // Create CSV line
        $csvLine = sprintf("\"%s\",\"%s\",\"%s\",\"%s\"\n", 
            $timestamp, 
            str_replace('"', '""', $email),
            str_replace('"', '""', $profession), 
            str_replace('"', '""', $downloadType)
        );
        
        // Append to CSV file
        $csvFile = 'datasets/downloads.csv';
        
        // Check if file exists, if not create with headers
        if (!file_exists($csvFile)) {
            $header = "timestamp,email,profession,download_type\n";
            if (!file_put_contents($csvFile, $header)) {
                echo json_encode(['success' => false, 'message' => 'Failed to create CSV file']);
                exit;
            }
        }
        
        // Append the new data
        if (file_put_contents($csvFile, $csvLine, FILE_APPEND | LOCK_EX)) {
            echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to write to CSV file']);
        }
    } else {
        $missingFields = [];
        if (!isset($input['email'])) $missingFields[] = 'email';
        if (!isset($input['profession'])) $missingFields[] = 'profession';
        if (!isset($input['downloadType'])) $missingFields[] = 'downloadType';
        
        echo json_encode([
            'success' => false, 
            'message' => 'Missing required fields: ' . implode(', ', $missingFields),
            'received_data' => $input
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}
?>