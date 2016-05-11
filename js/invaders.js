var Resources = require('./resources.js'),
    State = require('./state.js'),
    Sprite = require('./sprite.js'),
    Starfield = require('./starfield.js'),
    Key = require('./keymaster.min.js'),
    enemySpeed = 100,
    playerSpeed = 200;

document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 480;
  document.body.appendChild(canvas);

  Resources.load([
    'img/ufos.png',
    'img/fighter.png'
  ]);
  Resources.onReady(init.bind(null, ctx, canvas));
});

function requestAnimFrame(callback) {
  return window.requestAnimationFrame(callback)        ||
         window.webkitRequestAnimationFrame(callback)  ||
         window.mozRequestAnimationFrame(callback)     ||
         window.oRequestAnimationFrame(callback)       ||
         window.msRequestAnimationFrame(callback)      ||
         window.setTimeout(callback, 1000 / 60);
}

function init(ctx, canvas) {
  var lastTime = Date.now(),
  starField = new Starfield();

  for (var i = 0; i < 10; i++) {
    State.enemies.push({
      pos: [Math.random() * canvas.width,
            Math.random() * (canvas.height - 200)],
      sprite: new Sprite('img/ufos.png', [0, 0], [64.7, 64],
                         20, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    });
  }

  main(ctx, canvas, lastTime, starField);
}

function main(ctx, canvas, lastTime, starField) {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt, canvas, starField);
  render(ctx, canvas, starField);

  lastTime = now;
  requestAnimFrame(main.bind(null, ctx, canvas, lastTime, starField));
}

function render(ctx, canvas, starField) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  starField.stars.forEach(function (star) {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  renderEntity(State.player, ctx);

  State.enemies.forEach(function (enemy) {
    renderEntity(enemy, ctx);
  });
}

function renderEntity(entity, ctx) {
  ctx.save();
  ctx.translate(entity.pos[0], entity.pos[1]);
  entity.sprite.render(ctx);
  ctx.restore();
}

function update(dt, canvas, starField) {
  State.gameTime += dt;

  handleInput(dt);
  updateEntities(dt, canvas);
  updateStarfield(dt, starField);
}

function updateEntities(dt, canvas) {
  State.player.sprite.update(dt);

  State.enemies.forEach(function functionName(enemy) {
    if (enemy.pos[0] <= 0) {
      enemy.sprite.orientation = 'right';
    } else if (
        enemy.pos[0] >= canvas.width - enemy.sprite.size[0] &&
        enemy.sprite.orientation === 'right'
        ) {
      enemy.sprite.orientation = 'left';
    }

    if (enemy.sprite.orientation === 'left') {
      enemy.pos[0] -= enemySpeed * dt;
    } else {
      enemy.pos[0] += enemySpeed * dt;
    }

    enemy.sprite.update(dt);
  });
}

function updateStarfield(dt, starField) {
  starField.stars.forEach(function (star) {
    star.y += dt * star.velocity;

    if (star.y > starField.height) {
      star.x = Math.random() * starField.width;
      star.y = 0;
      star.size = (Math.random() * 3) + 1;
      star.velocity = (Math.random() *
        (starField.maxVelocity - starField.minVelocity)) +
          starField.minVelocity;
     }
  });
}

function handleInput(dt) {
  if (Key.isPressed('left')) {
    State.player.pos[0] -= playerSpeed * dt;
  } else if (Key.isPressed('right')) {
    State.player.pos[0] += playerSpeed * dt;
  }
}
