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

// Function to capitalize the first letter of a word
function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

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

    const formSGResponse = submission.responses;
    const firstNameText = JSON.stringify(formSGResponse[0].answer);
    const lastNameText = JSON.stringify(formSGResponse[1].answer);
    const emailText = JSON.stringify(formSGResponse[3].answer);
    const companyText = JSON.stringify(formSGResponse[4].answer);

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

      // List of email recipients
      const mailList = ['al-basra_al-bihaqi@jtc.gov.sg'];
      const ccList = [
        'siti_nurhazirah_mokmin@jtc.gov.sg',
        'xianghui556@gmail.com',
      ];

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
        <div>
            <h4 style="margin: 0;">Response from FormSG is as follows:</h4>
            <div style="border-bottom: 2px solid black; margin-bottom: 5px"></div><span>Request from ${firstNameText} ${lastNameText} from ${companyText} for ${projectText} was submitted. </span>
            <div><span>Please refer to FormSG for more information.</span></div>
            <div style="border-top: 2px solid black; text-align: end; margin-top: 5px"><span>Brought to you by the DBE team</span></div>
        </div>
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

      return res.status(200).send({ message: 'See console for submission!' });
    } else {
      return res
        .status(200)
        .send({ message: 'Could not decrypt the submission' });
    }
  }
);

module.exports = app;
