
var teamUrl = 'http://feeds.nfl.com/feeds-rs/teams/2016.json';
var teams = null;

function callUrl(url, funct){
	
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		if(request.readyState == 4 && request.status == 200){
			funct(request.responseText);
		}
	}
	request.open("GET", url, true);
	request.send(null);
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