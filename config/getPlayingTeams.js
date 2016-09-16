var apiAccess = require('../config/apiAccess');

/*var apiAccess = {};
apiAccess.callUrl = function(url, funct){
	
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		if(request.readyState == 4 && request.status == 200){
			funct(request.responseText);
		}
	}
	request.open("GET", url, true);
	request.send(null);
}*/

/*
 * How to use - 
 * First, use datesSet(); to check if the starting dates for the Pre and Reg season have been set
 * If false, call getFirstWeeks(Int curYear) to set them, where curYear is an integer representing the year of the season. That is, if the season starts in 2016, it would be the int 2015
 * To ensure that the dates have been set, due to asyncronity, ensure that datesSet() returns true before moving on 
 * 
 * Setup is now completed.
 * To get a set of games, call getGamesOnDate(Date date, boolean includeAllForWeek), where the date is a Date object representing the day which you want to retrieve games for, and includeAllForWeek is true only if you want to return all games for that week, instead of just for that day
 * This will populate GamesForWeek with the output data in an object of the form {date:The date supplied for retrieval, data:an array of game items}
 * You can retrieve what is stored in GamesForWeek using getRetrievedGameData(), but again due to asyncronity, verify that the date is accurate before proceeding with use.
 * 
 * For now, don't trust the scores, also the scores are strings. Game object is as such:
 * {date:a Date representing the game day, 
 * 	awayTeam:String represnting team nick(name), 
 * 	awayScore:String representing whatever was stored on the page for the score, 
 * 	homeTeam, 
 * 	homeScore}
 * 
 */

var PRE0Date;
var evalDate;
var REG1Date;
var GamesForWeek = {};
var TeamsForWeek = [];

//NOTE: WEEK ENDS ON MONDAY!
function constructScoreURI(season, part, week){
	//http://www.nfl.com/scores/2016/PRE0
	//season is year, part is PRE, REG, POST
	return "http://www.nfl.com/scores/"+season+"/"+part+week;
}

function constructYahooURI(url, element, attrType, attrValue){
	
	//http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url=%22http://www.nfl.com/schedules%22%20and%20
	//	xpath=%27//div[@class=%22schedules-list%22]%27&format=json

	var head = "http://query.yahooapis.com/v1/public/yql?q=select * from html where url=\"" + url + "\"";
	var xpath = constructXpathContains(element, attrType, attrValue);
	var jsonTail = '&format=json';
	
	return head + " and " + xpath + jsonTail; 
}

function constructXpath(elementType, attributeType, attributeValue){
	return "xpath='//" + elementType + "[@" + attributeType + "=\"" + attributeValue + "\"]'";
}

function constructXpathContains(elementType, attributeType, attributeValue){
	return "xpath='//" + elementType + "[contains(@" + attributeType + ",\"" + attributeValue + "\")]'";
}

function getFirstWeeks(currentYearInt){
	var queryFirstPRE = constructYahooURI("http://www.nfl.com/scores/2016/PRE0", "span", "title", "Date");
	var queryFirstREG = constructYahooURI("http://www.nfl.com/scores/2016/REG1", "span", "title", "Date");
	
	
	return Promise.all([apiAccess.callUrl(queryFirstPRE),apiAccess.callUrl(queryFirstREG)])
    .then(parseResponse);

    function parseResponse(response){
      var responsePre = response[0];
      var responseReg = response[1];
      var jsonPre = JSON.parse(responsePre);
      var spansPre = jsonPre.query.results.span;
      var itemPre = spansPre[spansPre.length-1] || spansPre;
      var datePre = itemPre.content
      
      datePre += " " + currentYearInt;
      
      datePre = new Date(datePre);
      //sets the date to be the next Monday, staying the same if it's already a monday
      datePre.setDate( datePre.getDate() + ((Math.abs( datePre.getDay() - 7 ) + 1)%7) );
      PRE0Date = datePre;
    
      var jsonReg = JSON.parse(responseReg);
      var spansReg = jsonReg.query.results.span;
      var itemReg = spansReg[spansReg.length-1] || spansReg;
      var dateReg = itemReg.content;
      
      
      dateReg += " " + currentYearInt;
      
      
      dateReg = new Date(dateReg);
      //sets the date to be the next Monday, staying the same if it's already a monday
      dateReg.setDate( dateReg.getDate() + ((Math.abs( dateReg.getDay() - 7 ) + 1)%7) );
      REG1Date = dateReg;//end of first week of Reg season
      evalDate = new Date(dateReg);
      evalDate.setDate(evalDate.getDate()-14);//end of last week of presesason
    }

}

function datesSet(){
	return PRE0Date != null && REG1Date != null;
}

function getGamesOnDate(date, includeAllGamesForWeek, returnWinners){
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	var season = date.getYear() + 1900; //stupid epochs
	var part;
	var dateOfPart;
	var week;


	if(date < evalDate){//Preseason
		part = "PRE";
		dateOfPart = PRE0Date;
	} else {
		part = "REG";
		dateOfPart = REG1Date;
	}
	//which week is it in?
	
	if(date <= dateOfPart){
		if(part=="PRE"){
			week = 1;
		} else {
			week = 1;
		}
	} else {
		//http://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates-using-javascript
		var diffDays = Math.round(Math.abs((date.getTime() - dateOfPart.getTime())/(oneDay)));
		var numWeeks = Math.floor(diffDays / 7);
		week = 1+numWeeks;
    console.log("I am the week", week);
	}
	
	var baseURI = constructScoreURI(season, part, week);
	var fullURI = constructYahooURI(baseURI, "div", "class", "scorebox-wrapper");
	
	
	return apiAccess.callUrl(fullURI)
    .then(function(response){

		var results = JSON.parse(response).query.results;
		
		//output = results.div[0] ;
		//Date span is output.div[0].div.div[0].p.span[0];
		//TeamAway Nick is output.div[0].div.div[1].div[0].div.div.div.p[1].a.content
		//TeamAway totalScore is output.div[0].div.div[1].div[0].div.div.p.content
		//TeamHome Nick is output.div[0].div.div[1].div[1].div.div.div.p[1].a.content
		
		
		var gamesOnDay = [];
    var winningTeams = [];
    var currentDate = new Date();
    var currentMDY= currentDate.getUTCMonth() + "/" + currentDate.getUTCDate() + "/" + currentDate.getUTCFullYear();
    var otherMDY= date.getUTCMonth() + "/" + date.getUTCDate() + "/" + date.getUTCFullYear();
    var playingTeams = []
    
		
		for ( i in results.div ){
			var game = {};
			
			if( otherMDY === currentMDY ){
        var item = results.div[i].div[0].div;
				game.date = new Date( item.div[0].p.span[0].content + " " + (date.getYear() + 1900) )
				game.awayTeam = item.div[1].div[0].div.div.div.p[1].a.content;
				game.awayScore = item.div[1].div[0].div.div.p.content;
				game.homeTeam = item.div[1].div[1].div.div.div.p[1].a.content;
				game.homeScore = item.div[1].div[1].div.div.p.content

        if(!includeAllGamesForWeek){
          console.log("In !includeAllgames");
          if(game.date == date){
            gamesOnDay.push(game);
            playingTeams.push(game.awayTeam, game.homeTeam);
          }
        } else {
          console.log("includeAllgames that I want");
          var keepDaysArray = [6,7,0,1];
          if(keepDaysArray.indexOf(game.date.getDay()) >-1 ) {
            gamesOnDay.push(game);
            playingTeams.push(game.awayTeam, game.homeTeam);
          }
        }

			} else {
        var item = results.div[i].div[0].div[1];
				game.awayTeam = item.div[0].div.div.div.p[1].a.content;
				game.awayScore = item.div[0].div.div.p[0].content;
				game.homeTeam = item.div[1].div.div.div.p[1].a.content;
				game.homeScore = item.div[1].div.div.p[0].content

        winningTeams.push(getWinner(game));
        gamesOnDay.push(game);
        playingTeams.push(game.awayTeam, game.homeTeam);

			}
      
		}

    TeamsForWeek = playingTeams;
		
		GamesForWeek.date = date;
		GamesForWeek.data = gamesOnDay;
    if(returnWinners) {
      GamesForWeek.data = winningTeams;
    }
    return Promise.resolve(GamesForWeek);
	});

}

function setGames(games) {
  var weekTeams = []
  GamesForWeek.data = games;
  games.forEach(function(game){
    weekTeams.push(game.awayTeam, game.homeTeam);
  })
  TeamsForWeek = weekTeams;
}

function getWinner(game) {
  return (game.homeScore > game.awayScore) ? game.homeTeam : game.awayTeam;
}

function getRetrievedGameData(){
	return GamesForWeek;
}

function getTeams() {
  return TeamsForWeek;
}

module.exports = {
  datesSet: datesSet,
  getFirstWeeks: getFirstWeeks,
  getGamesOnDate: getGamesOnDate,
  getRetrievedGameData: getRetrievedGameData,
  setGames: setGames,
  getTeams: getTeams
};
