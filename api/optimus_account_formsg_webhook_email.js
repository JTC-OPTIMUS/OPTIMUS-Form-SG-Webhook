// Import the required dependencies
const express = require('express');
require('dotenv').config(); // Load environment variables from a .env file
const app = express();

// Import the FormSG SDK and initialize it
const formsg = require('@opengovsg/formsg-sdk')();

// Define the URL where this webhook is hosted
const POST_URI =
  'https://optimus-ivory.vercel.app/api/optimus_account_formsg_webhook_email';

// Retrieve the form's secret key from environment variables
const formSecretKey = process.env.ACCOUNT_FORM_SECRET_KEY;

// Set to true if you need to download and decrypt attachments from submissions
const HAS_ATTACHMENTS = false;

// List of email recipients
const mailList = ['al-basra_al-bihaqi@jtc.gov.sg'];
const ccList = [
  'siti_nurhazirah_mokmin@jtc.gov.sg',
  'nikki_yong@jtc.gov.sg',
  'bryan_ong@jtc.gov.sg',
  'yve_xu@jtc.gov.sg',
];
const { google } = require('googleapis');
const sheets = google.sheets('v4');
require('dotenv').config(); // Load environment variables from a .env file

// Load your credentials JSON file
console.log(process.env.GOOGLE_API_KEY);
const credentials = JSON.parse(process.env.GOOGLE_API_KEY);

// Initialize the Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// The ID of your Google Sheets document
const SPREADSHEET_ID = process.env.ENV_SPREADSHEET_ID;

const RowTotal = 'Acct Request FormSG!B1';

// Define a POST route for the webhook
app.post(
  '/api/optimus_account_formsg_webhook_email',
  // Middleware for endpoint authentication by verifying signatures
  function (req, res, next) {
    try {
      formsg.webhooks.authenticate(req.get('X-Formsg-Signature'), POST_URI);
      // Continue processing the POST body
      return next();
    } catch (e) {
      // Unauthorized request
      return res.status(401).send({ message: 'Unauthorized' });
    }
  },
  // Middleware to parse JSON from the raw request body
  express.json(),
  // Middleware to decrypt the submission
  async function (req, res, next) {
    // If `verifiedContent` is provided in `req.body.data`, the return object
    // will include a verified key.
    const submission = HAS_ATTACHMENTS
      ? await formsg.crypto.decryptWithAttachments(formSecretKey, req.body.data)
      : formsg.crypto.decrypt(formSecretKey, req.body.data);

    console.log(submission);

    const formSGResponse = submission.responses;
    const firstNameText = formSGResponse[0].answer;
    const lastNameText = formSGResponse[1].answer;
    const designationText = formSGResponse[2].answer;
    const emailText = formSGResponse[3].answer;
    const optimusEmailText = emailText.split('@')[0] + '@optimus-pw.com';
    const companyText = formSGResponse[4].answer;
    const requestPurposeText = formSGResponse[7].answer;
    const additionalRemarksText = formSGResponse[11].answer;

    let pdd_swc_groupText = '';
    if (formSGResponse[10].answerArray) {
      pdd_swc_groupText = formSGResponse[10].answerArray.join(', ');
    }

    let userGroupText = '';
    if (formSGResponse[8].answerArray) {
      userGroupText = formSGResponse[8].answerArray.join(', ');
    }

    let userRoleText = '';
    if (formSGResponse[9].answerArray) {
      userRoleText = formSGResponse[9].answerArray.join(', ');
    }

    // Extract division information
    let projectText = 'Project not found';
    try {
      projectText = formSGResponse[5].answer;
      if (projectText.includes('Other')) {
        projectText = formSGResponse[6].answer;
      }
    } catch (e) {
      projectText = 'Division not found';
    }

    // If the decryption failed, submission will be `null`.
    if (submission) {
      // Import Nodemailer for sending emails
      const nodemailer = require('nodemailer');

      // Check if Nodemailer is installed
      try {
        console.log(require.resolve('nodemailer'));
      } catch (e) {
        console.error('nodemailer is not found');
        process.exit(e.code);
      }

      // Get the current date and time
      const currentdate = new Date();
      currentdate.setHours(currentdate.getHours() + 8); // Add 8 hours

      const pad = (num) => (num < 10 ? '0' : '') + num; // Function to pad with leading zeros

      // create a new datetime
      const datetime =
        'Webhook Time: ' +
        currentdate.getFullYear() +
        '-' +
        pad(currentdate.getMonth() + 1) +
        '-' +
        pad(currentdate.getDate()) +
        ' @ ' +
        pad(currentdate.getHours()) +
        ':' +
        pad(currentdate.getMinutes()) +
        ':' +
        pad(currentdate.getSeconds());

      const excelTime =
        currentdate.getFullYear() +
        '-' +
        pad(currentdate.getMonth() + 1) +
        '-' +
        pad(currentdate.getDate()) +
        ' ' +
        pad(currentdate.getHours()) +
        ':' +
        pad(currentdate.getMinutes()) +
        ':' +
        pad(currentdate.getSeconds());

      // Email configuration
      const mailOptions = {
        from: 'jtcoptimus@gmail.com',
        to: mailList,
        cc: ccList,
        subject: 'OPTIMUS - Account Request Alert',
        html: `<div style="border: 1px solid black; padding: 10px; border-radius:10px;">
        <h1>
            NEW OPTIMUS Account Request</h1>
        <h4>${datetime}</h4>
        <div style="border: 1px solid black; margin-bottom: 5px;"></div>
        <div style="display: flex; justify-content: center; align-items: center;">
            <table style="border-collapse: collapse; border: 1px solid black; border-radius: 5px;">
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">
                        First Name</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${firstNameText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Last Name</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${lastNameText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Designation</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${designationText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">OPTIMUS Email</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${optimusEmailText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Company Email</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${emailText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Company</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${companyText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${projectText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Purpose of Request</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${requestPurposeText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">User Role For Project</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${userRoleText}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Additional Remarks
                    </th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${additionalRemarksText}</td>
                </tr>
                
            </table>
        </div>
        <div style="border-top: 2px solid black; text-align: end; margin-top: 5px"><span>Brought to you by the DBE team</span></div>
      </div>`,
      };

      // Create a transporter for sending emails
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jtcoptimus@gmail.com',
          pass: 'hfhjkvuushpgrjud',
        },
      });

      // Verify the email server's configuration
      await new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log('Server is ready');
            resolve(success);
          }
        });
      });

      // Send the email
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log('Email sent!');
            resolve(info);
          }
        });
      });

      // Update google sheets
      const sheetsApi = await sheets.spreadsheets.values.get({
        auth: await auth.getClient(),
        spreadsheetId: SPREADSHEET_ID,
        range: RowTotal,
      });

      // Define the row number where you want to write the values
      const rowIndex = parseInt(sheetsApi.data.values[0][0]) + 7;

      // Define the values to write
      const valuesToWriteAcct = [
        [
          '',
          excelTime,
          'Success',
          firstNameText,
          lastNameText,
          designationText,
          emailText,
          companyText,
          projectText,
          requestPurposeText,
          userGroupText,
          '',
          '',
          pdd_swc_groupText,
          additionalRemarksText,
          '',
          '', // Project Role
          '', // SYNCHRO Project Role
        ],
      ];

      // Define the values to write
      const valuesToWriteSMTRequest = [
        [
          '',
          '',
          firstNameText,
          lastNameText,
          designationText,
          optimusEmailText,
          '',
          emailText,
          companyText,
          projectText,
          '', // Number of Roles  
        ],
      ];

      // Create the request to update the values
      const appendRequest = await sheets.spreadsheets.values.append({
        auth: await auth.getClient(),
        spreadsheetId: SPREADSHEET_ID,
        range:  `Acct Request FormSG!A${rowIndex}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: valuesToWriteAcct,
        },
      });

      // console.log('Values updated successfully:', appendRequest.data);

      return res.status(200).send({ message: 'See console for submission!' });
    } else {
      return res
        .status(200)
        .send({ message: 'Could not decrypt the submission' });
    }
  }
);

module.exports = app;
