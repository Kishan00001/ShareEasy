const nodemailer = require('nodemailer');
async function sendMail({from,to,subject,text,html}){
    let transporter = nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port : process.env.SMTP_PORT,
        auth:{
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });
    let info = await transporter.sendMail({
        from:`ShareEasy User ${from}`,
        to,subject,text,html
    });
}
//SMTP : Simple Mail Transfer Protocol
module.exports = sendMail;