"use strict";

module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    inProgress: DataTypes.BOOLEAN,
    weekNumber: DataTypes.INTEGER,
    totalIn:    DataTypes.INTEGER,
    loserGame:  DataTypes.BOOLEAN
  });


  return Game;
};
