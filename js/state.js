var Sprite = require('./sprite.js');

var State = {
  player: {
    pos: [0, 450],
    sprite: new Sprite(
      'img/fighter.png', [0, 0], [50, 135], 1, [5]
    )
  },

  playerBullets: [],

  enemyBullets: [],

  enemies: [],

  explosions: [],

  lastFire: Date.now(),

  gameTime: 0,

  score: 0,

  playerDirection: 'center'
};

module.exports = State;
