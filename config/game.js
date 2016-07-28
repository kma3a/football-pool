var currentGame = null;

function set(game) {
  currentGame = game;
}

function get() {
  return currentGame;
}

function buyIn() {
}

function picksInCurrentGame(picks) {
  picks = picks || [];
  var inPicks = [];
  for (i=0; i < picks.length; i++) {
    var pick = picks[i];
    console.log("Pick", pick.gameId, pick.hasWon, pick.week);
    if(pick.GameId === currentGame.id && pick.hasWon && pick.week + 1 === currentGame.weekNumber) {
      inPicks.push(pick);
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
