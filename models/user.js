"use strict";
var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    admin   : DataTypes.BOOLEAN
  },{
  hooks : {
    beforeCreate: function(user, options) {
      return user.password = createPasswordHash(user.password);
    },
    beforeUpdate: function(user, options) {
      return user.password = createPasswordHash(user.password);
    }
  },
  instanceMethods: {
    validPassword: function(password) {
      console.log("I have password:", this.password);
      return bcrypt.compareSync(password, this.password);
    }
   }
  });

  function createPasswordHash(password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }


  return User;
};
