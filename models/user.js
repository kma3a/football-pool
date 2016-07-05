"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    admin   : DataTypes.BOOLEAN
  });

User.sync();

var user = User.create({username: "helloWorld1", email: "d.chan42@gmail.com", password: "Test1234", admin: true});
}
