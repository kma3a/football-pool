//var apiAccess = require('apiAccess');

var apiAccess = {};
apiAccess.callUrl = function(url, funct){
	
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		if(request.readyState == 4 && request.status == 200){
			funct(request.responseText);
		}
	}
	request.open("GET", url, true);
	request.send(null);
}


var PRE0Date;
var evalDate;
var REG1Date;
var Output;

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
	var xpath = constructXpath(element, attrType, attrValue);
	var jsonTail = '&format=json';
	
	return head + " and " + xpath + jsonTail; 
}

function constructXpath(elementType, attributeType, attributeValue){
	return "xpath='//" + elementType + "[@" + attributeType + "=\"" + attributeValue + "\"]'";
}

function getFirstWeeks(currentYearInt){
	var queryFirstPRE = constructYahooURI("http://www.nfl.com/scores/2016/PRE0", "span", "title", "Date Airing");
	var queryFirstREG = constructYahooURI("http://www.nfl.com/scores/2016/REG1", "span", "title", "Date Airing");
	
	console.log(queryFirstPRE);
	
	apiAccess.callUrl(queryFirstPRE,function(response){
		var json = JSON.parse(response);
		var spans = json.query.results.span;
		var item = spans[spans.length-1] || spans;
		var date = item.content
		
		date += " " + currentYearInt;
		
		date = new Date(date);
		//sets the date to be the next Monday, staying the same if it's already a monday
		date.setDate( date.getDate() + ((Math.abs( date.getDay() - 7 ) + 1)%7) );
		PRE0Date = date;
	});
	
	apiAccess.callUrl(queryFirstREG, function(response){
		var json = JSON.parse(response);
		var spans = json.query.results.span;
		var item = spans[spans.length-1] || spans;
		var date = item.content;
		
		
		date += " " + currentYearInt;
		
		
		date = new Date(date);
		//sets the date to be the next Monday, staying the same if it's already a monday
		date.setDate( date.getDate() + ((Math.abs( date.getDay() - 7 ) + 1)%7) );
		REG1Date = date;//end of first week of Reg season
		evalDate = new Date(date);
		evalDate.setDate(evalDate.getDate()-7);//end of last week of presesason
	})
	
	
}

function datesSet(){
	return PRE0Date != null && REG1Date != null;
}

function getGamesOnDate(date){
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	var season = date.getYear() + 1900; //stupid epochs
	var part;
	var dateOfPart;
	var week;
	
	if(date <= evalDate){//Preseason
		part = "PRE";
		dateOfPart = PRE0Date;
	} else {
		part = "REG";
		dateOfPart = REG1Date;
	}
	//which week is it in?
	
	if(date <= dateOfPart){
		if(part=="PRE"){
			week = 0;
		} else {
			week = 1;
		}
	} else {
		//http://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates-using-javascript
		var diffDays = Math.round(Math.abs((date.getTime() - dateOfPart.getTime())/(oneDay)));
		var numWeeks = Math.round(diffDays / 7);
		week = 1+numWeeks;
	}
	
	var baseURI = constructScoreURI(season, part, week);
	var fullURI = constructYahooURI(baseURI, "div", "class", "scorebox-wrapper pre");
	
	
	apiAccess.callUrl(fullURI, function(response){
		var results = JSON.parse(response).query.results;
		
		output = results.div[0] ;
		//Date span is output.div[0].div.div[0].p.span[0];
		//TeamAway Nick is output.div[0].div.div[1].div[0].div.div.div.p[1].a.content
		//TeamAway totalScore is output.div[0].div.div[1].div[0].div.div.p.content
		//TeamHome Nick is output.div[0].div.div[1].div[1].div.div.div.p[1].a.content
		
		
		var gamesOnDay = [];
		
		for ( i in results.div ){
			var game = {};
			
			game.date = new Date( results.div[i].div[0].div.div[0].p.span[0].content + " " + (date.getYear() + 1900) )
			game.awayTeam = results.div[i].div[0].div.div[1].div[0].div.div.div.p[1].a.content;
			game.awayScore = results.div[i].div[0].div.div[1].div[0].div.div.p.content;
			game.homeTeam = results.div[i].div[0].div.div[1].div[1].div.div.div.p[1].a.content;
			game.homeScore = results.div[i].div[0].div.div[1].div[1].div.div.p.content
			
			if(game.date == date){
				gamesOnDay.push(game);
			}
		}
	});
}