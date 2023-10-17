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
console.log('checkpoint 1');

app.post(
  '/api/idd_formsg_webhook_email',
  // Endpoint authentication by verifying signatures
  function (req, res, next) {
    try {
      formsg.webhooks.authenticate(req.get('X-Formsg-Signature'), POST_URI);
      // Continue processing the POST body
      return next();
    } catch (e) {
      return next();
      // return res.status(401).send({ message: 'Unauthorized' })
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
      const mailOptions = {
        from: 'jtcoptimus@gmail.com',
        to: 'xianghui556@gmail.com',
        subject: 'Nodemailer Testing',
        text: 'Testing' + JSON.stringify(submission),
      };
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jtcoptimus@gmail.com',
          pass: 'hfhj kvuu shpg rjud',
        },
        port: 587,
        host: 'smtp.gmail.com',
      });
      const info = await transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log('Error occurs', err);
          return res.status(500).send({ message: 'Error sending email' });
        } else {
          console.log('Email sent!');
          return res.status(200).send({ message: 'Email sent successfully!' });
        }
      });

      console.log('This is submission' + JSON.stringify(submission));
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
