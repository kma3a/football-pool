var CronJob = require('cron').CronJob;
var job2 = require('../config/weekWinners');
var job3 = require('../config/fridayPick');

console.log("I am doign things", job2, job3);
//cron job to update the picks to put in who is winning for the week and the weekNumber for the game.

var job2 = new CronJob({
    cronTime: '00 15 00 * * 2',
    onTick: job2.start,
    start: false
});
job2.start();

//cron job for checking the picks and adding any of the 
var job3 = new CronJob({
    cronTime: '00 10 00 * * 6',
    onTick: job3.start,
    start: false
});
job3.start();

