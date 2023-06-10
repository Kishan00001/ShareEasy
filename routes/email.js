const nodemailer = require('nodemailer');
async function sendMail({from,to,subject,text,html}){
    let transporter = nodemailer.createTransport({
        host:'smtp-relay.sendinblue.com',
        port : 587,
        auth:{
            user:'kishanmaharana04@gmail.com',
            pass:'BZqfICKxsUPRtG2E'
        }
    });
    let info = await transporter.sendMail({
        from:`ShareEasy User ${from}`,
        to,subject,text,html
    });
}
//SMTP : Simple Mail Transfer Protocol
module.exports = sendMail;

// const nodemailer = require("nodemailer");
// const sendMail = async(req,res)=>{
//     let testAccount = await nodemailer.createTestAccount();
//     const transporter = await nodemailer.createTransport({
//         host: 'smtp-relay.sendinblue.com',//'smtp.gmail.com',//'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'kishanmaharana04@gmail.com',//'dummymail3022@gmail.com',//'crawford.crist20@ethereal.email',
//             pass: 'BZqfICKxsUPRtG2E',//'AllZWell@2022',//'qDj3t85mhDbhT8dKUy'
//         }
//     });
//     let info = await transporter.sendMail({
//         from: '"Kamal EMSI👻" <kacharya443@gmail.com>', // sender address
//         to: "kishanmaharana04@gmail.com,kacharya443@gmail.com", // list of receivers
//         subject: "Hello ShareEasy User✔", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>", // html body
//     });
//     console.log("Message sent: %s", info.messageId);
//     res.json(info);
// }
// module.exports = sendMail;