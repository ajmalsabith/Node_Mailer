
const { Router } = require('express');
const router = Router();
const dotenv=require('dotenv').config()


const nodemailer = require('nodemailer');

router.post('/sendmail',async (req,res)=>{

    const {sub,mail,attach,text}= req.body
    const attacharray=[]
    if(req.body){
        attach.forEach(element => {

            const base64String = element.filestring.split(',')[1];

            const obj={
                filename: element.filename,
                content: base64String,
                encoding: 'base64',
            }

            attacharray.push(obj)
        })

        const mailOptions = {
            from:process.env.user, 
            to: mail,
            subject:sub,
            text: text,
            attachments:attacharray,
        };


        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, 
            secure: true, 
            auth: {
                user:process.env.user, 
                pass:process.env.pass, 
            },
        });
   

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send({
                    message:"Email Sending Failed..!"
                })         
            } else {
    
                console.log(`Email sent: ${info.response}`);
                res.status(200).send({
                    message:"Email Sent Successfully"
                })

            }
        });

    }
    

})

module.exports = router
