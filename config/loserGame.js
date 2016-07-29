var currentGame = null;

function set(game) {
  currentGame = game;
}

function get() {
  return currentGame;
}

function buyIn(picks) {
  if (!currentGame || !isBuyInWeek() ) {return {};}

  picks = picks || [];
  var inPicks = [];
  for (i=0; i < picks.length; i++) {
    var pick = picks[i];
    if(pick.GameId === currentGame.id && !pick.hasWon && pick.week + 1 === currentGame.weekNumber) {
      inPicks.push(pick);
    }
  }
  return inPicks

}

function isBuyInWeek(){
  var buyInWeeks = [2,3];
  return buyInWeeks.indexOf(currentGame.weekNumber) > -1;
}

function picksInCurrentGame(picks) {
  if (!currentGame ) {return {};}
  picks = picks || [];
  var inPicks = [];
  if( currentGame.weekNumber > 1) {
    for (i=0; i < picks.length; i++) {
      var pick = picks[i];
      if(pick.GameId === currentGame.id && pick.hasWon && pick.week + 1 === currentGame.weekNumber) {
        inPicks.push(pick);
      }
    }
  } else {
    for (i=0; i < picks.length; i++) {
      var pick = picks[i];
      if(pick.GameId !== currentGame.id && !pick.hasWon) {
        inPicks.push(pick);
      }
    }
  }
  return inPicks
}

module.exports = {
  set: set,
  get: get,
  buyIn: buyIn,
  picksInCurrentGame: picksInCurrentGame
}
