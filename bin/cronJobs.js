#! /app/bin/node
var job2 = require('../config/weekWinners');
var job1 = require('../config/fridayEmail');
var job3 = require('../config/fridayPick');

var date = new Date().getDay();
if( date === 6){
  //cron job for checking the picks and adding any of the 
    job3.start()
} else if (date === 2) {
//cron job to update the picks to put in who is winning for the week and the weekNumber for the game.
//commenting out this week because I ran the job early
    //job2.start()
} else if (date === 5) {
//cron job to update the picks to put in who is winning for the week and the weekNumber for the game.
    job1.start()
}




