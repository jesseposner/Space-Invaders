var Sprite = require('./sprite.js');

var State = {
  player: {
    pos: [0, 335],
    sprite: new Sprite(
      'img/fighter.png', [0, 0], [50, 135], 15, [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
      ]
    )
  },

  bullets: [],

  enemies: [],

  explosions: [],

  lastFire: Date.now(),

  gameTime: 0,

  score: 0
};

module.exports = State;
