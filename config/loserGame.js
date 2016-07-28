var currentGame = null;

function set(game) {
  currentGame = game;
}

function get() {
  return currentGame;
}

function buyIn() {
}



module.exports = {
  set: set,
  get: get,
  buyIn: buyIn
}
