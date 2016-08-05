"use strict";

module.exports = function(sequelize, DataTypes) {
  var Pick = sequelize.define("Pick", {
    teamChoice: DataTypes.STRING,
    active:     {type:DataTypes.BOOLEAN, defaultValue: true},
    hasWon:     {type: DataTypes.BOOLEAN, defaultValue: false},
    week:       DataTypes.INTEGER,
    hasPaid:    {type: DataTypes.BOOLEAN, defaultValue: false}
  });


  return Pick;
};
