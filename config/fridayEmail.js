var mail = require('../config/nodeMailer');
var User = require('../models/index.js').User;

function fridayEmail() {
  var message = {
    subject: "Hurry and lock your picks!",
    text: "Hey it is currently Friday and picks are still being made if you have not already done so please login and put in your pics"
    };
  User.findAll({attributes: ['email']}).then(function(emailList) {
    if(emailList && emailList.length > 0) {
      var allEmails = emailList.map(function (user) {
        return user.email});
      message.to = allEmails;
      mail.sendEveryoneEmail(message);
    } else {
      console.log("there are no emails");
    }
  }, function(err) {
      console.log("I errored", err);
  });
}

fridayEmail();
