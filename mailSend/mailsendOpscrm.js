
const { Router } = require('express');
const router = Router();
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');



const CLIENT_OPSCRM_ID = process.env.OPSCRMNEW_CLIENTID;
const CLIENT_OPSCRM_SECRET = process.env.OPSCRMNEW_CLIENT_SECRET;
const REFRESH_OPSCRM_TOKEN = process.env.OPSCRMNEW_REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';


const oAuth2ClientOPSCRM = new google.auth.OAuth2(
    CLIENT_OPSCRM_ID,
    CLIENT_OPSCRM_SECRET,
    REDIRECT_URI
  );

  
oAuth2ClientOPSCRM.setCredentials({ refresh_token: REFRESH_OPSCRM_TOKEN });


router.post('/sendmailopscrmorg', async (req, res) => {
    const { sub, mail, cc, bcc, attach, html } = req.body; // Add bcc here
    const attachArray = [];
    if (req.body) {
        attach.forEach(element => {
            const base64String = element.filestring.split(',')[1];
            const obj = {
                filename: element.filename,
                content: base64String,
                encoding: 'base64',
            };
            attachArray.push(obj);
        });

        try {
            const accessToken = await oAuth2ClientOPSCRM.getAccessToken();

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.OPMSCRMNEW_EMAIL,
                    clientId: CLIENT_OPSCRM_ID,
                    clientSecret: CLIENT_OPSCRM_SECRET,
                    refreshToken: REFRESH_OPSCRM_TOKEN,
                    accessToken: accessToken.token,
                },
            });

            const mailOptions = {
                from: process.env.OPMSCRMNEW_EMAIL,
                to: Array.isArray(mail) ? mail.join(', ') : mail,
                cc: Array.isArray(cc) ? cc.join(', ') : cc,
                bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc, // Add bcc field here
                subject: sub,
                html: html,
                attachments: attachArray,
            };

            // console.log(mailOptions);
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    if (error.responseCode === 550 || error.response.includes("No such user")) {
                        console.log('Email address does not exist');
                        res.status(400).send({
                            message: "Email address does not exist."
                        });
                    } else {
                        console.log(error);
                        res.status(400).send({
                            message: "Email sending failed."
                        });
                    }
                } else {
                    console.log(`Email sent: ${info.response}`);
                    res.status(200).send({
                        message: "Email sent successfully."
                    });
                }
            });

        } catch (error) {
            console.log('Error generating access token', error);
            res.status(500).send({
                message: "Failed to send email."
            });
        }
    }
});


module.exports = router;
