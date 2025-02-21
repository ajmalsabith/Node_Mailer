const { Router } = require('express');
const router = Router();
const dotenv = require('dotenv').config();
const CryptoJS = require("crypto-js");
const twilio = require('twilio');


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const otpStore = {};


const SECRET_KEY = "OTP_ENCRYPT_OPSM"; // Use a strong secret key

function encryptOTP(otp) {
    return CryptoJS.AES.encrypt(otp.toString(), SECRET_KEY).toString();
}

router.post('/otp-sms',async (req,res)=>{

    const  phone  = req.body.data;
    console.log(req.body);
    

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const encotp= encryptOTP(otp)
    otpStore[phone] = otp; 

    try {
        await client.messages.create({
            body: `Your OPSManager Login OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        console.log('successs',phone,otp);
        res.status(200).send({
            message: "OTP sent successfully",
            otp:encotp


        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Failed to send OTP"
        });
        console.log('fialed......',phone);
        // res.status(500).json({ success: false, message: 'Failed to send OTP', error });
    }
})


router.post('/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    if (otpStore[phone] === otp) {
        delete otpStore[phone]; // Remove OTP after verification
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});





module.exports= router