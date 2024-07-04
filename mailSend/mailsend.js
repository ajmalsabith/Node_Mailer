const { Router } = require('express');
const router = Router();
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

router.post('/sendmail', async (req, res) => {
    const { sub, mail, cc, attach, text } = req.body;
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
            text: text,
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

module.exports = router;
