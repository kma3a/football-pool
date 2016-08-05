"use strict";

module.exports = function(sequelize, DataTypes) {
  var Game = sequelize.define("Game", {
    inProgress: {type:DataTypes.BOOLEAN, defaultValue: true},
    weekNumber: {type:DataTypes.INTEGER, defaultValue: 1},
    totalIn:    {type:DataTypes.INTEGER, defaultValue:0},
    loserGame:  {type:DataTypes.BOOLEAN, defaultValue:false}
  });


  return Game;
};
