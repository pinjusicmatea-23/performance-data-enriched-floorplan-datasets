// Google Apps Script to receive data from website and save to Google Sheets
// Instructions:
// 1. Go to script.google.com
// 2. Create new project
// 3. Replace the default code with this script
// 4. Save and deploy as web app
// 5. When you see "Google hasn't verified this app" warning:
//    - Click "Advanced" (bottom left)
//    - Click "Go to [Your Project Name] (unsafe)"
//    - This is safe because it's YOUR script
// 6. Copy the deployment URL and update YOUR_SCRIPT_ID in index.html

function doPost(e) {
  try {
    // Get the data from the POST request
    var data = JSON.parse(e.postData.contents);
    
    // Open the Google Sheet (replace with your sheet ID)
    var sheet = SpreadsheetApp.openById('1r_WDwEXjeS3pzYL9HTZsYTh2lx9o3PX4FQh3pCBjVus').getActiveSheet();
    
    // Check if headers exist, if not add them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Email', 'Profession', 'Download Type']);
    }
    
    // Add the data to the sheet
    sheet.appendRow([
      data.timestamp,
      data.email,
      data.profession,
      data.downloadType
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Download tracking service is running")
    .setMimeType(ContentService.MimeType.TEXT);
}