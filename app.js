var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var CronJob = require('cron').CronJob;
var mail = require('./config/nodeMailer');
var User = require('./models/index.js').User;
var Pick = require('./models/index.js').Pick;
var game = require("./config/game");
var loserGame = require("./config/loserGame");
var playingTeams = require("./config/getPlayingTeams");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSession({
  secret: 'mySecretKey', 
  proxy: true, 
  resave: true, 
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  next();
});

app.use(function(req, res, next) {
  game.init();
  loserGame.init();
  if (!playingTeams.datesSet()){
    console.log("gonna get things");
    var date = new Date();
    playingTeams.getFirstWeeks(2016)
      .then(playingTeams.getGamesOnDate.bind(null, date, true))
      .then(function(games) {
        next();
      });
  } else {
    next();
  }
});

var routes = require('./routes/index');
var user = require('./routes/user');
var admin = require('./routes/admin');
var picks = require('./routes/picks');
var games = require('./routes/game');

//cron job
var job = new CronJob({
    cronTime: '00 00 12 * * 5',
      onTick: function() {
        var message = {
          subject: "Hurry and lock your pick!",
          text: "Hey it is currently Friday and picks are still being made if you have not already done so please login and put in your pics"
          };
        User.findAll({attributes: ['email']}).then(function(emailList) {
          if(emailList && emailList.length > 0) {
            var allEmails = emailList.map(function (user) {
              return user.email});
            message.to = allEmails;
            mail.sendEveryoneEmail(message)
          } else {
            console.log("there are no emails");
          }
        }, function(err) {
            console.log("I errored", err);
        });
      },
      start: false,
});
job.start();


var job2 = new CronJob({
    cronTime: '00 00 6 * * 2',
      onTick: function() {
        var date = new Date();
        date.setDate(date.getDate() - 7 )
        playingTeams.getFirstWeeks(2016)
          .then(playingTeams.getGamesOnDate.bind(null, date, true, true))
          .then(function(games) {
              var game = game.get();
              var loserGame = loserGame.get();
              Pick.findAll({where: {GameId: game.id, week: game.weekNumber}})
                .then(function(gamePicks) {
                    updatePicks(gamePicks)
                    game.update({weekNumber: game.weekNumber +1});
                });
              
              if(loserGame) {
                Pick.findAll({where: {GameId: loserGame.id, week: loserGame.weekNumber}})
                  .then( function(gamePicks) {
                    updatePicks(gamePicks)
                    loserGame.update({weekNumber: loserGame.weekNumber +1});
                  });
              }

            function updatePicks(gamePicks){
              gamePicks.forEach(function(pick){
               if(games.indexof(pick.chosenTeam) >=0) {
                 pick.update({hasWon: true});
              })
            }
          });
      },
      start: false,
});
job2.start();



var job3 = new CronJob({
    cronTime: '00 10 12 * * 6',
      onTick: function() {
        if (!playingTeams.datesSet()){
          console.log("gonna get things");
          var date = new Date();
          playingTeams.getFirstWeeks(2016)
            .then(playingTeams.getGamesOnDate.bind(null, date, true))
            .then(function(games) {
              var newChoice = games[game.length -1].awayTeam;
              setChoice(newChoice);
            });
        } else {
          var newChoice = games[game.length -1].awayTeam;
          setChoice(newChoice)
        }
        
          function setChoice() {
            var game = game.get();
            var loserGame = loserGame.get();
            Pick.findAll({where: {GameId: game.id, week: game.weekNumber-1, hasWon:true, active: true}})
              .then(function(gamePicks) {
                  updatePicks(gamePicks)
              });
            
            if(loserGame) {
              Pick.findAll({where: {GameId: loserGame.id, week: loserGame.weekNumber -1, hasWon:true, active: true}})
                .then( function(gamePicks) {
                  updatePicks(gamePicks)
                });
            }
          }

          function updatePicks(gamePicks){
            gamePicks.forEach(function(pick){
              Pick.create({week: pick.week+1, hasWon:false, hasPaid: pick.hasPaid, teamChoice: newChoice,GameId: pick.GameId, UserId:pick.UserId});
            })
          }

        });
      },
      start: false,
});
job3.start();



app.use('/', routes);
app.use('/user', user);
app.use('/admin', admin);
app.use('/picks', picks);
app.use('/games', games);

require('./config/passport')(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
