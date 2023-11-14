// Import the required dependencies
const express = require('express');
require('dotenv').config(); // Load environment variables from a .env file
const app = express();
const jwt = require('jsonwebtoken');

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
  'xianghui556@gmail.com',
];
const { google } = require('googleapis');
const sheets = google.sheets('v4');
require('dotenv').config(); // Load environment variables from a .env file

// Load your credentials JSON file
let credentials = {};
const token = // JWT token
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6Imp0Yy1vcHRpbXVzLXdlYmhvb2siLCJwcml2YXRlX2tleV9pZCI6IjJhMWRhNDBhNDdhMjVmMzYyYWViNGVjMzYyMzNkZjQ3MGM1NDI0MjYiLCJwcml2YXRlX2tleSI6Ii0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZnSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2d3Z2dTa0FnRUFBb0lCQVFDWnpEMjFROEpKOGRsRFxuaFZQMGlqNlpGdEQ5NVZncDNKczdOMGttZWtDUkxkVUR4Z21LQ0hvS21NcGJzbjM4bElmc09kUHhwbkR5TDJZNlxuWVM4enpqUGVaNU1yY0puYVR5RXpSWlVsRHc4aUtxT05YN0dOUmpvUDljRlJ5b2JSWlc3VGgvd0JVWjhqcGdHVVxuVlBsV2prSGx5aUhVOHZxM2Nrcms4RWRWNmQ4WGorZGpwVTlGei9vZDQzRWNjV3paZlViK0FxUHRhMVI0RnlVZVxuUzVDdHliczhxdU1lWVErUDZXcHk5MGNOTzdMSkJMSFMvT3JQS2dyYlhHdWZBNUdKT2dxTE5pS2w3cWVMSlBDM1xuamlTV25EczAwUVpmUTVZQTBJSlQvUm5XNGpkWXZsdGtHamxZcUo4dVZJa3htbnhpK25VUUxteXVGSGJiVGMxVlxuQmdVaE5EajNBZ01CQUFFQ2dnRUFGb3M4TG1KWXkrc0NER1l5U01HczdGYk9XckV3QzY3VktFaHgxZ3lNZzF0alxuQXBNWVdkM2xPY0ZzeENVMVYzMVVNVG5HeWdDNlJKM1REOUtvRHlGMk0rOGR3UHZYNllxNDFLR3ArNDBxRERtUVxuME12S3BHazdZSlNHK2x6RUIxU2xlcWRQdHNmR21ueWVkYVpCQ0VHQkFsUnZRaDQ5eHY4ZllGQ2lQRU0wV3VrWVxuUmpqTGpoZXNCc3poV0V1cmZxc1VuWSt1Q1MvS0JXTkRsTG9yN25uZEtVczBtaE50SlgrWFNoZExVODdDL0JGQVxuRDhjSGxDYW1qZGZydURHcVZST0NiQ1E1UE8zWXh3aWgvZ1pnSGU4YVVRV0NWOTdYSlhJTWJ4U2E1ZlcxVll4SFxuZTRuUnNPTDQ2c1JyTzQ5c3ZHOTlsWlFiZEQ3VDZaTEl2OExLWXYxalJRS0JnUURYT3pta3g0aEV6b1gzSjY2dFxua3dxVW1NcVplVlc3UDFZRkxQYWJDSUJUV0VpaSs5blNDQSttVU9OU1VBVlJCTHRJQm5GcU81SzdDTS9yN29PRFxuNXZyZ3BMblMzbm1xODUwaEFPTXRabDlLb2hQMGZ4cFZidXozY1JkYUNObFVHdlNHUzMxSys0Zy8wQnFJbnNJc1xuTEVlbmdScUZUUGRHZVIrL3ZiRUlwQ2dlUlFLQmdRQzI3Z3QvUHQwWTVZdkMzSzd0R2hBUUQ3KzRQdnB6akpWWFxuaUM3WkNNKzg1YVBMckVMTS90dHBJdlNEUjZaUHlKSXBHOVhoNUhvU295c1IycVhvTERYN3R0am56akppNHNaNVxubEx2OWdsejl5YUJFS2krbHYwQy8wZ08zVjVlUjQ3MWNLMmZUM3B1V2NjT3VydFhNNjJ4aUtjRXNIQzRLUUlFT1xuRWRKQjdXUDhDd0tCZ1FDejh6YU15SzdzS0dmbGJ1NGkvWStaRWU1Q1J5b2d0aUdyamg1WkhOQjkzcEJNaEpsblxuZTRucUdqTVZmUVlVNlFuVWZGNlMzV0FldEkxeXl5WjJQOFo5ei92MWpFRFpaM2wyUUpHd1FhbG1jd0NRS1R6UlxuTlQ4MjJ2MFZMOVRVOXZ4KzA5cmJ1RllBVkhQNnloRzZjUU12ejBkbk1DU0diWHJZQ3pkYTdEVUdxUUtCZ1FDZFxuMitDS0IwcXZFRy9DVWNTV2tYWXBGaDRoTmgvVkZRMVBReE1DY2NzclBKUlR6Nnk1MEhpeFN0dnNhaWxJRWxLblxuTFFFdWRZY3VqQ1kvdXdxT3g1QXlUd0R4VVF4RUwyU05TTi9OamZFSGhUWkxmSWd2cFZLUDlnRUU5NDZ4OC9EV1xuR0JMNlQ5QytUQ0JNbjAyYkQ5SXhCODFPYm1jQXE5ZHl0OGhVNGpIMUx3S0JnRVZaS0NkNGdoaHBtczJydFM1c1xuUmR6RjMvOEY4azBIVUNNVTVrQkhTTHV3bmFGck4rc3BLRTBXbFhaVWIrWXluSm9FV1BoQVgrMDUwVzRzUXpIWVxucXlXSGVkeDFJemVVTHRuQVNQRjFpdFdhaW14ZTFEZkpkZEZ4UWp6NHMyamwwL2l3ZHdDcm9ud3lEUW9XVFZ1OFxuTTZqbHlneWtpTmJDREI5VWJoai8rV082XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLCJjbGllbnRfZW1haWwiOiJvcHRpbXVzLXJlcXVlc3Qtd2ViaG9va0BqdGMtb3B0aW11cy13ZWJob29rLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiY2xpZW50X2lkIjoiMTA3NDA1ODkwMDUzMTk0MjQyODY0IiwiYXV0aF91cmkiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsInRva2VuX3VyaSI6Imh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjoiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwiY2xpZW50X3g1MDlfY2VydF91cmwiOiJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L29wdGltdXMtcmVxdWVzdC13ZWJob29rJTQwanRjLW9wdGltdXMtd2ViaG9vay5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVuaXZlcnNlX2RvbWFpbiI6Imdvb2dsZWFwaXMuY29tIn0.oFq8BjSOI6ejXb32vUI13h3vdGq2pgeyoTwkWCUmfP4';
const secretKey = process.env.JWT_SECRET_KEY;

jwt.verify(token, secretKey, (err, decoded) => {
  if (err) {
    // JWT verification failed
    console.error('JWT verification failed');
  } else {
    // JWT decoded successfully
    credentials = decoded;
  }
});

// Initialize the Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// The ID of your Google Sheets document
const SPREADSHEET_ID = process.env.ENV_SPREADSHEET_ID;
const SMT_SPREADSHEET_ID = process.env.ENV_SMT_SPREADSHEET_ID;

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

    // console.log(submission);

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
    let userRoleNumbers = 0;
    if (formSGResponse[9].answerArray) {
      userRoleText = formSGResponse[9].answerArray.join(', ');
      userRoleNumbers = formSGResponse[9].answerArray.length;
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
        require.resolve('nodemailer');
      } catch (e) {
        console.error('nodemailer is not found');
        process.exit(e.code);
      }

      // Get the current date and time
      const currentdate = new Date();
      currentdate.setHours(currentdate.getHours() + 8); // Add 8 hours

      const pad = (num) => (num < 10 ? '0' : '') + num; // Function to pad with leading zeros

      // time formats
      const excelDate =
        currentdate.getFullYear() +
        '-' +
        pad(currentdate.getMonth() + 1) +
        '-' +
        pad(currentdate.getDate());

      const excelTime2 =
        pad(currentdate.getHours()) +
        ':' +
        pad(currentdate.getMinutes()) +
        ':' +
        pad(currentdate.getSeconds());

      const excelTime = excelDate + ' ' + excelTime2;

      const datetime = 'Webhook Time: ' + excelDate + ' @ ' + excelTime2;

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
      const emailSendingPromise = new Promise((resolve, reject) => {
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
      const google_auth = await auth.getClient();
      let emailArray = [];
      let get_emailArray_response;

      if (
        requestPurposeText === 'Create Account' ||
        requestPurposeText === 'Access to Project (only for Existing Accounts)'
      ) {
        get_emailArray_response = await sheets.spreadsheets.values.get({
          auth: google_auth,
          spreadsheetId: SPREADSHEET_ID,
          range: 'Accounts SMT-Request!AA:AA',
        });
        emailArray = await get_emailArray_response.data.values;
        // console.log(emailArray); 
      }

      let userRoleTextRemark = '';
      let SMT_Pass_Gate = false;
      switch (requestPurposeText) {
        case 'Create Account':
          if (emailArray.includes(optimusEmailText)) {
            userRoleTextRemark =
              '(Auto Detection) Existing user with additional user role (Do not remove any current user role)';
          } else {
            userRoleTextRemark = 'Account creation and assign user role';
          }
          userRoleTextRemark = 'Account creation and assign user role';
          SMT_Pass_Gate = true;
          break;
        case 'Access to Project (only for Existing Accounts)':
          if (emailArray.includes(optimusEmailText)) {
            userRoleTextRemark =
              'Existing user with additional user role (Do not remove any current user role)';
          } else {
            userRoleTextRemark =
              '(Auto Detection) Account creation and assign user role';
          }
          userRoleTextRemark =
            'Existing user with additional user role (Do not remove any current user role)';
          SMT_Pass_Gate = true;
          break;
        case 'Unlock Account/Reset Password':
          userRoleTextRemark = 'To unlock user account and assign user role';
          SMT_Pass_Gate = true;
          break;
        case 'Disable Account':
          userRoleTextRemark = 'To remove user role and disable account';
          SMT_Pass_Gate = true;
          break;
        case 'Unpair PingID from old device':
          userRoleTextRemark = 'To help unpair PingID from old device';
          SMT_Pass_Gate = false;
          break;
        case 'Change OTP mobile number':
          userRoleTextRemark = 'To help change OTP mobile number';
          SMT_Pass_Gate = false;
          break;
        default:
          break;
      }

      // Define the values to write for Acct Request FormSG tab
      const valuesToWriteAcct = [
        [
          '',
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

      // Define the values to write for Account SMT-Request
      const valuesToWriteAccountSMTRequest = [
        [
          '',
          '',
          excelDate,
          firstNameText,
          lastNameText,
          designationText,
          optimusEmailText,
          emailText,
          companyText,
          projectText,
          userRoleTextRemark,
        ],
      ];

      // Create the request to update the values for Acct Request FormSG tab
      const sheet_response1 = sheets.spreadsheets.values.append({
        auth: google_auth,
        spreadsheetId: SPREADSHEET_ID,
        range: `Acct Request FormSG!A6`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: valuesToWriteAcct,
        },
      });

      // Create the request to update the values for Accounts SMT-Request
      const sheet_response2 = sheets.spreadsheets.values.append({
        auth: google_auth,
        spreadsheetId: SPREADSHEET_ID,
        range: `Accounts SMT-Request!A3`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: valuesToWriteAccountSMTRequest,
        },
      });

      let sheet_response3;

      if (SMT_Pass_Gate) {
        // Define the values to write for SMT-Request
        const valuesToWriteSMTRequest = [
          [
            '',
            firstNameText,
            lastNameText,
            designationText,
            optimusEmailText,
            emailText,
            companyText,
            projectText,
            userRoleText,
            userRoleTextRemark,
            userRoleNumbers,
          ],
        ];

        // Create the request to update the values for SMT-Request
        sheet_response3 = sheets.spreadsheets.values.append({
          auth: google_auth,
          spreadsheetId: SMT_SPREADSHEET_ID,
          range: `SMT_Account!A3`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: valuesToWriteSMTRequest,
          },
        });
      }

      // Wait for all the requests to complete before ending the function
      await Promise.all([
        sheet_response1,
        sheet_response2,
        sheet_response3,
        emailSendingPromise,
      ])
        .then(() => {
          console.log('Submission successful!');
        })
        .catch((err) => {
          console.log(err);
        });

      return res.status(200).send({ message: 'See console for submission!' });
    } else {
      return res
        .status(200)
        .send({ message: 'Could not decrypt the submission' });
    }
  }
);

module.exports = app;
