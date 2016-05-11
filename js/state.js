var Sprite = require('./sprite.js');

var State = {
  player: {
    pos: [0, 0],
    sprite: new Sprite('img/sprites.png', [0, 0], [39, 39], 16, [0, 1])
  },

  bullets: [],

  enemies: [],

  explosions: [],

  lastFire: Date.now(),

  gameTime: 0,

  score: 0
};

module.exports = State;
