// This example uses Express to receive webhooks
// https://stackoverflow.com/questions/27599614/var-express-requireexpress-var-app-express-what-is-express-is-it
const express = require('express');
require('dotenv').config();
const app = express();

// Instantiating formsg-sdk without parameters default to using the package's
// production public signing key.
const formsg = require('@opengovsg/formsg-sdk')();

// This is where your domain is hosted, and should match
// the URI supplied to FormSG in the form dashboard
const POST_URI =
  'https://optimus-ivory.vercel.app/api/idd_formsg_webhook_email';

// Your form's secret key downloaded from FormSG upon form creation
const formSecretKey = process.env.FORM_SECRET_KEY;

// Set to true if you need to download and decrypt attachments from submissions
const HAS_ATTACHMENTS = false;

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

app.post(
  '/api/idd_formsg_webhook_email',
  // Endpoint authentication by verifying signatures
  function (req, res, next) {
    try {
      formsg.webhooks.authenticate(req.get('X-Formsg-Signature'), POST_URI);
      // Continue processing the POST body
      return next();
    } catch (e) {
      return res.status(401).send({ message: 'Unauthorized' })
    }
  },
  // Parse JSON from raw request body
  express.json(),
  // Decrypt the submission
  async function (req, res, next) {
    // If `verifiedContent` is provided in `req.body.data`, the return object
    // will include a verified key.
    const submission = HAS_ATTACHMENTS
      ? await formsg.crypto.decryptWithAttachments(formSecretKey, req.body.data)
      : formsg.crypto.decrypt(formSecretKey, req.body.data);

    // If the decryption failed, submission will be `null`.
    if (submission) {
      const nodemailer = require('nodemailer');
      try {
        console.log(require.resolve('nodemailer'));
      } catch (e) {
        console.error('nodemailer is not found');
        process.exit(e.code);
      }
      console.log('Nodemailer is running');
      const formSGResponse = submission;
      let officerName = 'Officer Name not found';
      console.log('test1:' + formSGResponse);
      console.log('test2:' + formSGResponse.responses[2].answer);
      console.log(officerName)
      try {
        officerName = formSGResponse.responses[1].answer
          .split('@')[0]
          .split('_')
          .map(capitalizeFirstLetter)
          .join(' ');
      } catch (e) {
        officerName = 'Officer Name not found';
      }

      let formDivision = 'Division not found';
      try {
        formDivision = formSGResponse.responses[2].answer;
        if (formDivision.includes('Other')){
          formDivision = formSGResponse.responses[3].answer;
        }
      } catch (e) {
        formDivision = 'Division not found';
      }

      let formProjectType = 'Project Type not found';
      try {
        formProjectType = formSGResponse.responses[8].answer;
        if (formProjectType.includes('Other')){
          formProjectType = formSGResponse.responses[9].answer;
        }
      }
      catch (e) {
        formProjectType = 'Project Type not found';
      }

      const mailOptions = {
        from: 'jtcoptimus@gmail.com',
        to: 'xianghui556@gmail.com',
        subject: 'OPTIMUS - JTC IDD Alert',
        html: `<div style="border: 1px solid black; padding: 10px; text-align: center; justify-content: center; align-items: center; border-radius:10px;">
        <h1>
            JTC IDD Alert</h1>
        <div style="display: flex; justify-content: center; align-items: center;">
            <table style="border-collapse: collapse; width: 80%; border: 1px solid black; border-radius: 5px;">
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
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[1].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Title</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[6].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Scope</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[7].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Type</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formProjectType}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">PROMPT Project ID</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[5].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project SUM</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[10].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Design Duration (Months)</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[12].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Project Construction Duration (Months)
                    </th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[13].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Construction Commencement Date</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[14].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Current Project Stage</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[11].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">EIR Issued</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[15].answer}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid black; padding: 5px; text-align: left;">Additional Remarks</th>
                    <td style="border: 1px solid black; padding: 5px; text-align: left;">${formSGResponse.responses[16].answer}</td>
                </tr>
            </table>
        </div>
    
    </div>`,
      };
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jtcoptimus@gmail.com',
          pass: 'hfhjkvuushpgrjud',
        },
      });
      await new Promise((resolve, reject) => {
        // verify connection configuration
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
      await new Promise((resolve, reject) => {
        // send mail
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

      // console.log('This is submission' + JSON.stringify(submission));
      return res.status(200).send({ message: 'See console for submission!' });
    } else {
      return res
        .status(200)
        .send({ message: 'Could not decrypt the submission' });
      // Could not decrypt the submission
    }
  }
);

module.exports = app;
