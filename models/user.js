"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.String,
    password: DataTypes.String,
    admin   : DataTypes.Boolean
  });

User.sync();
