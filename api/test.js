const { google } = require('googleapis');
const sheets = google.sheets('v4');
require('dotenv').config(); // Load environment variables from a .env file

// Load your credentials JSON file
const credentials = JSON.parse(process.env.GOOGLE_API_KEY);

// Initialize the Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// The ID of your Google Sheets document
const SPREADSHEET_ID = process.env.ENV_SPREADSHEET_ID;

const RowTotal = 'Acct Request FormSG!B1';

async function getData() {
  const sheetsApi = await sheets.spreadsheets.values.get({
    auth: await auth.getClient(),
    spreadsheetId: SPREADSHEET_ID,
    range: RowTotal,
  });

  // Define the row number where you want to write the values
  const rowIndex = parseInt(sheetsApi.data.values[0][0]) + 7;

  // Define the values you want to write
  const valuesToWrite = [
    [
      '6528a5d0074ea8001270ae3b',
      '13/10/2023 10:05:00',
      'Success',
      'First Name',
      'Last Name',
      'Designation',
      'Company Email',
      'Company',
      'Project',
      'Purpose of Request',
      'User Type',
      'AMK Project Role',
      'Other Projects',
      'PDD SWC Groups',
      'Additional Remarks',
      'Do you require access to SYNCHRO forms ONLY?',
      'Project Role',
      'SYNCHRO Project Role',
      'Project',
      'Others',
    ],
  ];

  // Create the request to update the values
  const updateRequest = await sheets.spreadsheets.values.update({
    auth: await auth.getClient(),
    spreadsheetId: SPREADSHEET_ID,
    range: `Acct Request FormSG!A${rowIndex}`,
    valueInputOption: 'RAW',
    resource: { values: valuesToWrite },
  });

  console.log('Values updated successfully:', updateRequest.data);
}

getData();
