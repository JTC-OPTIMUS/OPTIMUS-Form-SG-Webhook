// Import the required dependencies
const express = require('express');
require('dotenv').config(); // Load environment variables from a .env file
const app = express();

// Import the FormSG SDK and initialize it
const formsg = require('@opengovsg/formsg-sdk')();
const axios = require('axios');

function getRandomInt() {
  return Math.floor(Math.random() * 4) + 1;
}

async function get_joke_of_the_day() {
  const url1 = 'https://api.api-ninjas.com/v1/jokes';
  const url2 = 'https://api.api-ninjas.com/v1/quotes';
  const url3 = 'https://api.api-ninjas.com/v1/riddles';
  const url4 = 'https://api.api-ninjas.com/v1/trivia';
  let url;
  const randomInt = parseInt(getRandomInt());
  switch (randomInt) {
    case 1:
      url = url1;
      break;
    case 2:
      url = url2;
      break;
    case 3:
      url = url3;
      break;
    case 4:
      url = url4;
      break;
    default:
      url = url1;
  }
  const headers = {
    'Content-type': 'application/json',
    'X-Api-Key': 'fX2y4Gqh0rq7wNDlTdHyBQ==wEHLoluYDHF9yWXW',
  };
  let replies;
  await axios
    .get(url, { headers })
    .then((response) => {
      console.log(randomInt);
      console.log(response.data[0]);
      switch (randomInt) {
        case 1:
          replies = 'Joke: ' + response.data[0].joke;
          break;
        case 2:
          replies =
            'Quote: "' +
            response.data[0].quote +
            '" - ' +
            response.data[0].author;
          break;
        case 3:
          replies =
            'Riddle: ' +
            response.data[0].question +
            ' =-= ' +
            response.data[0].answer;
          break;
        case 4:
          replies =
            'Trivia: ' +
            response.data[0].question +
            ' =-= ' +
            response.data[0].answer;
          break;
      }
    })
    .catch((error) => {
      console.error('Error fetching joke:', error.message);
    });
  return replies;
}

// Define the URL where this webhook is hosted
const POST_URI =
  'https://optimus-ivory.vercel.app/api/idd_formsg_webhook_email';

// Retrieve the form's secret key from environment variables
const formSecretKey = process.env.IDD_FORM_SECRET_KEY;

// Set to true if you need to download and decrypt attachments from submissions
const HAS_ATTACHMENTS = false;

// Function to capitalize the first letter of a word
function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// List of email recipients
const mailList = ['al-basra_al-bihaqi@jtc.gov.sg', 'ang_jin_leong@jtc.gov.sg'];
const ccList = [
  'siti_nurhazirah_mokmin@jtc.gov.sg',
  'nikki_yong@jtc.gov.sg',
  'yve_xu@jtc.gov.sg',
  'xianghui556@gmail.com',
];

// Define a POST route for the webhook
app.post(
  '/api/idd_formsg_webhook_email',
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

      console.log('Nodemailer is running');

      // Extract data from the FormSG submission
      const formSGResponse = submission;
      let officerName = 'Officer Name not found';
      try {
        // Extract and format the officer's name
        officerName = formSGResponse.responses[1].answer
          .split('@')[0]
          .split('_')
          .map(capitalizeFirstLetter)
          .join(' ');
      } catch (e) {
        officerName = 'Officer Name not found';
      }

      // Extract division information
      let formDivision = 'Division not found';
      try {
        formDivision = formSGResponse.responses[2].answer;
        if (formDivision.includes('Other')) {
          formDivision = formSGResponse.responses[3].answer;
        }
      } catch (e) {
        formDivision = 'Division not found';
      }

      // Extract project type information
      let formProjectType = 'Project Type not found';
      try {
        formProjectType = formSGResponse.responses[8].answer;
        if (formProjectType.includes('Other')) {
          formProjectType = formSGResponse.responses[9].answer;
        }
      } catch (e) {
        formProjectType = 'Project Type not found';
      }

      const formEmail = formSGResponse.responses[1].answer;
      const formProjectTitle = formSGResponse.responses[6].answer;
      const formProjectScope = formSGResponse.responses[7].answer;
      const formProjectID = formSGResponse.responses[5].answer;
      const formProjectSum = formSGResponse.responses[10].answer;
      const formDesignDuration = formSGResponse.responses[12].answer;
      const formProjectConstructionDuration =
        formSGResponse.responses[13].answer;
      const formConstructionCommencementDate =
        formSGResponse.responses[14].answer;
      const formCurrentProjectStage = formSGResponse.responses[11].answer;
      const formEIRIssue = formSGResponse.responses[15].answer;
      const formAdditionalRemarks = formSGResponse.responses[16].answer;

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

      const getJoke = await get_joke_of_the_day();
      let footerEntertainment;
      if (getJoke.includes('=-=')) {
        splitJoke = getJoke.split('=-=');
        footerEntertainment = `
        <div style="border-top: 2px solid black; margin-top: 5px"><span>${splitJoke[0]}</span><span style="color: rgba(255, 255, 255, 0);"> ${splitJoke[1]}</span></span></div>`;
      }
      else {
        footerEntertainment = `
        <div style="border-top: 2px solid black; margin-top: 5px"><span>${getJoke}</span></div>
        `;
      }

      // Email configuration
      const mailOptions = {
        from: 'jtcoptimus@gmail.com',
        to: mailList,
        cc: ccList,
        subject: 'OPTIMUS - JTC IDD Alert',
        html: `<div style="border: 1px solid black; padding: 10px; border-radius:10px;">
        <h1>
            NEW JTC IDD Alert</h1>
        <h4>${datetime}</h4>
        <div style="border: 1px solid black; margin-bottom: 5px;"></div>
        <div style="display: flex; justify-content: center; align-items: center;">
            <table style="border-collapse: collapse; border: 1px solid black; border-radius: 5px;">
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">
                        Officer Name</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${officerName}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Division</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formDivision}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Email</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formEmail}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Title</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectTitle}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Scope</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectScope}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Type</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectType}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">PROMPT Project ID</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectID}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project SUM</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectSum}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Design Duration (Months)</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formDesignDuration}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Construction Duration (Months)
                    </th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectConstructionDuration}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Construction Commencement Date</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formConstructionCommencementDate}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Current Project Stage</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formCurrentProjectStage}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">EIR Issued</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formEIRIssue}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Additional Remarks</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formAdditionalRemarks}</td>
                </tr>
            </table>
        </div>
        ${footerEntertainment}
        <div style="text-align: end; margin-top: 5px"><span>Brought to you by the DBE team</span></div>
      </div>`,
      };

      // Create a transporter for sending emails
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jtcoptimus@gmail.com',
          pass: 'dfpsqxxumiwrmtty',
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
