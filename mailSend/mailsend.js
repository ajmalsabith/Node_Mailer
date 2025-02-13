const { Router } = require('express');
const router = Router();
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const { google } = require('googleapis');

const CryptoJS = require("crypto-js");



// gmail apis conf
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;



const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

  

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

router.post('/sendmail', async (req, res) => {
    const { sub, mail, cc, attach, html } = req.body;
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
            const accessToken = await oAuth2Client.getAccessToken();

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.USER_EMAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken.token,
                },
            });

            const mailOptions = {
                from: process.env.USER_EMAIL,
                to: Array.isArray(mail) ? mail.join(', ') : mail,
                cc: Array.isArray(cc) ? cc.join(', ') : cc,
                subject: sub,
                html: html,
                attachments: attachArray,
            };

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



router.post('/sendmailOtp', async (req, res) => {
    const { sub, mail, cc, attach, html,username } = req.body;
    const otp= generateOTP()
    const encyotp= encryptOTP(otp)
    const email=mail[0]
   const  OtpDes = `Dear ${username},<br><br>
    A login request has been made from your username ${email}.<br>
    As an added level of security, you are required to complete the logon process by entering the below 6-digit OTP:<br><br>
    ${otp}<br><br>
    Thanks,<br>
    OPSManager`;

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
            const accessToken = await oAuth2Client.getAccessToken();

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.USER_EMAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken.token,
                },
            });

            const mailOptions = {
                from: process.env.USER_EMAIL,
                to: Array.isArray(mail) ? mail.join(', ') : mail,
                cc: Array.isArray(cc) ? cc.join(', ') : cc,
                subject: sub,
                html:OtpDes,
                attachments: attachArray,
            };

            // console.log(mailOptions,'mailoption...');
            

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
                        message: "Email sent successfully.",
                        otp:encyotp


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


const SECRET_KEY = "OTP_ENCRYPT_OPSM"; // Use a strong secret key

function encryptOTP(otp) {
    return CryptoJS.AES.encrypt(otp.toString(), SECRET_KEY).toString();
}

function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }



const CLIENT_OPSCRM_ID = process.env.OPSCRM_CLIENTID;
const CLIENT_OPSCRM_SECRET = process.env.OPSCRM_CLIENT_SECRET;
const REFRESH_OPSCRM_TOKEN = process.env.OPSCRM_REFRESH_TOKEN;


const oAuth2ClientOPSCRM = new google.auth.OAuth2(
    CLIENT_OPSCRM_ID,
    CLIENT_OPSCRM_SECRET,
    REDIRECT_URI
  );

  
oAuth2ClientOPSCRM.setCredentials({ refresh_token: REFRESH_OPSCRM_TOKEN });


router.post('/sendmailopscrm', async (req, res) => {
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
                    user: process.env.OPMSCRM_EMAIL,
                    clientId: CLIENT_OPSCRM_ID,
                    clientSecret: CLIENT_OPSCRM_SECRET,
                    refreshToken: REFRESH_OPSCRM_TOKEN,
                    accessToken: accessToken.token,
                },
            });

            const mailOptions = {
                from: process.env.OPMSCRM_EMAIL,
                to: Array.isArray(mail) ? mail.join(', ') : mail,
                cc: Array.isArray(cc) ? cc.join(', ') : cc,
                bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc, // Add bcc field here
                subject: sub,
                html: html,
                attachments: attachArray,
            };

            console.log(mailOptions);
            
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







router.post('/sendmailold', async (req, res) => {
    const { sub, mail, cc, attach, html } = req.body;
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

        const mailOptions = {
            from: process.env.user,
            to: Array.isArray(mail) ? mail.join(', ') : mail,
            cc: Array.isArray(cc) ? cc.join(', ') : cc,
            subject: sub,
            html: html,
            attachments: attachArray,
        };

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.user,
                pass: process.env.pass,
            },
        });


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
    }
});

router.post("/mail-invoice", async (req, res) => {
    const { sub, mail, cc, html } = req.body;

    try {
        // console.log('Launching Puppeteer');
        const browser = await puppeteer.launch({
            headless: true,  // Ensure Puppeteer runs in headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Log console messages from the page
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

        // console.log('Setting content');
        await page.setContent(html, { waitUntil: 'networkidle2', timeout: 120000 });

        // console.log('Generating PDF');
        const pdfBuffer = await page.pdf({ format: 'A4', timeout: 120000 });
        await browser.close();

        const attachArray = [{
            filename: 'opsm.pdf',
            content: pdfBuffer,
        }];

        const mailOptions = {
            from: process.env.user,
            to: Array.isArray(mail) ? mail.join(', ') : mail,
            cc: Array.isArray(cc) ? cc.join(', ') : cc,
            subject: sub,
            html: '<p>Invoice.</p>',
            attachments: attachArray,
        };

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.user,
                pass: process.env.pass,
            },
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                res.status(400).send({ message: "Email sending failed." });
            } else {
                console.log(`Email sent: ${info.response}`);
                res.status(200).send({ message: "Email sent successfully." });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});




// router.post('/send-mail-microsoft', async (req, res) => {
//     const { sub, mail, cc, attach, html } = req.body; 
//     const senderEmail = 'noreply@company.com'; // Shared mailbox or user mailbox

//     // Fetch access token for Microsoft Graph API
//     const accessToken = await getAccessToken();
    
//     if (!accessToken) {
//         console.error("No access token available");
//         return res.status(500).send('Access token not available');
//     }

//     // Construct toRecipients and ccRecipients from arrays
//     const toRecipients = mail.map(email => ({
//         emailAddress: { address: email }
//     }));
    
//     const ccRecipients = cc ? cc.map(email => ({
//         emailAddress: { address: email }
//     })) : [];

//     // Prepare attachments in Base64 format
//     const attachments = attach.map(file => ({
//         "@odata.type": "#microsoft.graph.fileAttachment",
//         name: file.name, // Filename of the attachment
//         contentBytes: file.contentBytes, // Base64-encoded content
//         contentType: file.contentType, // Content type (e.g., "application/pdf")
//     }));

//     const emailData = {
//         message: {
//             subject: sub,
//             body: {
//                 contentType: "HTML",
//                 content: html || "This is a test email sent from Node.js using Microsoft Graph API!"
//             },
//             toRecipients: toRecipients,
//             ccRecipients: ccRecipients,
//             attachments: attachments,
//         },
//         saveToSentItems: "true"
//     };

//     try {
//         // Send the email using Microsoft Graph API
//         const response = await axios.post(
//             `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`, // Use dynamic sender email
//             { message: emailData.message, saveToSentItems: "true" },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//         console.log('Email sent successfully:', response.data);
//         res.status(200).send('Email sent successfully');
//     } catch (error) {
//         console.error("Error sending email:", error.response ? error.response.data : error.message);
//         res.status(500).send(error.response ? error.response.data : error.message);
//     }
// });


module.exports = router;
