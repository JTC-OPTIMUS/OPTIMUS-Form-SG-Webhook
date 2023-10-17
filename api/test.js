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


module.exports = async (req, res) => {
  console.log('Starting Genshin Draw Watchlist Get API');
  try {
    const x = formsg.webhooks.authenticate(req.get('X-Formsg-Signature'), POST_URI);
    console.log(x);
    const submission = HAS_ATTACHMENTS
      ? await formsg.crypto.decryptWithAttachments(formSecretKey, req.body.data)
      : formsg.crypto.decrypt(formSecretKey, req.body.data);
      console.log(submission);
    return res.json(false);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
    