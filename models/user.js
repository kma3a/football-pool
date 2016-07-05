"use strict";
var db = require('index.js'),
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;


module.exports = function() {
  var User = sequelize.define("User", {
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    admin   : Sequelize.BOOLEAN
  });

  User.sync({force: true});


  return User;

}
