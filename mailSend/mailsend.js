const { Router } = require('express');
const router = Router();
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const { google } = require('googleapis');


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

module.exports = router;
