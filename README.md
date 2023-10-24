# FormSG Webhook API

This project includes a set of APIs designed to handle webhook integrations with FormSG submissions. It offers support for two specific FormSG forms:

OPTIMUS Account Request Form Submission Webhook API: This API handles the webhook for submissions of the OPTIMUS account request form. It processes form data, sends email notifications, and performs necessary actions upon submission.

JTC IDD Form Submission Webhook API: This API manages webhooks for JTC IDD form submissions, decrypting the data and sending email notifications with formatted submission details.

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## API Endpoints

### `optimus_account_formsg_webhook_email.js`

- Description: This API handles a webhook for the OPTIMUS account request form submission.
- Endpoint: `/api/optimus_account_formsg_webhook_email`

### `idd_formsg_webhook_email.js`

- Description: This API handles a webhook for the JTC IDD form submission.
- Endpoint: `/api/idd_formsg_webhook_email`

## Deployment

Theses APIs are hosted on Vercel. For more information on Vercel, please visit [Vercel](https://vercel.com).