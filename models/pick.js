"use strict";

module.exports = function(sequelize, DataTypes) {
  var Pick = sequelize.define("Pick", {
    teamChoice: DataTypes.STRING,
    active:     DataTypes.BOOLEAN,
    hasWon:     DataTypes.BOOLEAN,
    week:       DataTypes.INTEGER,
    hasPaid:    DataTypes.BOOLEAN
  });


  return Pick;
};
