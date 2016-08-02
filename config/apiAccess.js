var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var teamUrl = 'http://feeds.nfl.com/feeds-rs/teams/2016.json';
var teams = null;

function callUrl(url, funct){
  console.log("I am in callUrl");
	
	var request = new XMLHttpRequest();

  return new Promise (function (resolve, reject) {
    request.onreadystatechange = function(){
      if(request.readyState == 4 && request.status == 200){
        resolve(request.responseText);
      }
    }

    request.open("GET", url, true);
    request.send(null);
  });
}

function formatTeamJson(json){
	var teamsJson = JSON.parse(json);
	var teamsArray = teamsJson.teams;
	var teamsOutput = new Array();
	for (i in teamsArray){
		var teamObject = {};
		
		teamObject.abbr = teamsArray[i].abbr;
		teamObject.fullName = teamsArray[i].fullName;
		teamObject.nick = teamsArray[i].nick;
		teamsOutput.push(teamObject);
	}
	teams = teamsOutput;
}

function getTeams(){
	if (teams == null){		
		callUrl(teamUrl, formatTeamJson);
	}
	
	return teams;
}

module.exports = {
  callUrl: callUrl
};
