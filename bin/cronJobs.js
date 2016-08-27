#! /app/bin/node
var job2 = require('../config/weekWinners');
var job3 = require('../config/fridayPick');

var date = new Date().getDay();
if( date === 6){
  //cron job for checking the picks and adding any of the 
    job3.start()
} else if (date === 2) {
//cron job to update the picks to put in who is winning for the week and the weekNumber for the game.
    job2.start()
}


