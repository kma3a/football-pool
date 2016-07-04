"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.String,
    email: DataTypes.String,
    password: DataTypes.String,
    admin   : DataTypes.Boolean
  });

User.sync();

var user = User.create({username: "helloWorld1", email: "d.chan42@gmail.com", password: "Test1234", admin: true});
