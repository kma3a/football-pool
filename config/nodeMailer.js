var CONSTANT = require('../config/constant');
var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: CONSTANT.username,
    pass: CONSTANT.password
  }
});

function sendWelcomeEmail(email, username) {
  var mailOptions = {
    to: email,
    subject: "Welcome to Football Pools",
    text: 'Welcome ' + username + ' to football pools!'
  };

  sendMail(mailOptions);

}


function sendUpdateEmail(email) {
  var mailOptions = {
    to: email,
    subject: "Football Pools Profile Update",
    text: 'This is an email from Football Pool to let you know that you have updated your account information.'
  };

  sendMail(mailOptions);
}

function sendMail(mailOptions) {
  transport.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}



module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendUpdateEmail: sendUpdateEmail
};
