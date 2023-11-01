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
const SPREADSHEET_ID = process.env.ENV_SMT_SPREADSHEET_ID;
// Define the range for the data, starting from column T in row 1.
const startColumn = 'M';
const sheetName = 'SMT_Account';
const range = `${sheetName}!${startColumn}1:1`;

async function getData() {

  // Fetch the data in the specified range.
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: range,
  });

  const values = response.data.values[0]; // Assuming you only need data from row 1.

  console.log(values);
}

getData();
