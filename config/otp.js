const nodemailer=require('nodemailer');

module.exports={
  mailTransporter:nodemailer.createTransport({
    service:'gmail',
    auth:{
      user: 'alanjosephclt@gmail.com',
      pass: 'dwnyspezkisjhbze'
    },
  }),
  OTP:`${Math.floor(1000+Math.random()*9000)}`,
}