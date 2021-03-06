'use strict';


var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var pg        = require('pg');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.js')[env];
var db        = {};

if (process.env.DATABASE_URL) {
  var sequelize = new Sequelize(process.env.DATABASE_URL, {dialect: config.dialect, protocol: 'postgres', dialectOptions: { ssl: true}});
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}



fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    if (model instanceof Array) {
      model.forEach(function(m) {
      db[m.name] = m;
      });
    } else {
      db[model.name] = model;
    }
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.User.hasMany(db.Pick);
db.Game.hasMany(db.Pick);
db.Pick.belongsTo(db.User);
db.Pick.belongsTo(db.Game);


db.sequelize = sequelize;
db.Sequelize = Sequelize;
//sequelize.sync({force:true});

module.exports = db;
