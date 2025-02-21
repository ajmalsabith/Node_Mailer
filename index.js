const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
const routes= require('./mailSend/mailsend')
const otpsmsroutes= require('./mailSend/sms-otp')
const cors = require('cors');

app.use(cors({ origin: true }));

app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));

app.use(express.json());

app.use('',routes,);
app.use('',otpsmsroutes);


app.listen(5000,()=>{
    console.log('App is listening on port 5000');
})

