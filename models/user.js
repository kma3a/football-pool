"use strict";
var path = require('path');
var db = require(path.resolve( __dirname, "./index.js")),
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
