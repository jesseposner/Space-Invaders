var Resources = require('./resources.js'),
    State = require('./state.js'),
    Sprite = require('./sprite.js'),
    Starfield = require('./starfield.js'),
    Key = require('./keymaster.min.js'),
    enemySpeed = 100,
    playerSpeed = 200,
    playerBulletSpeed = 500,
    enemyBulletSpeed = 100;

document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 600;
  document.body.appendChild(canvas);

  Resources.load([
    'img/ufos.png',
    'img/fighter.png',
    'img/fighter-bullet.png',
    'img/explosion.png',
    'img/enemy-bullet.png'
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

  document.getElementById('play-again')
          .addEventListener('click', function() {
            reset(canvas);
  });

  reset(canvas);

  main(ctx, canvas, lastTime, starField);
}

function main(ctx, canvas, lastTime, starField) {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  if (State.enemies.length === 0) {
    for (var i = 0; i < Math.floor(Math.random() * 10) + 10; i++) {
      State.enemies.push({
        pos: [Math.random() * canvas.width,
              Math.random() * (canvas.height - 300)],
        sprite: new Sprite(
          'img/ufos.png',
          [0, 0],
          [64, 64],
          20,
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        )
      });
    }
  }

  State.enemies.forEach(function (enemy, index) {
    if (Math.random() < 0.004) {
      State.enemyBullets.push(
        { pos: [enemy.pos[0], enemy.pos[1] + enemy.sprite.size[1] / 2],
          sprite: new Sprite(
            'img/enemy-bullet.png',
            [0, 0],
            [50, 50],
            30,
            [
             1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 13,
             12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
            ]
         )
      });
    }
  });

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

  State.playerBullets.forEach(function (bullet) {
    renderEntity(bullet, ctx);
  });

  State.enemies.forEach(function (enemy) {
    renderEntity(enemy, ctx);
  });

  State.enemyBullets.forEach(function (bullet) {
    renderEntity(bullet, ctx);
  });

  State.explosions.forEach(function (explosion) {
    renderEntity(explosion, ctx);
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

  handleInput(dt, canvas);
  updateEntities(dt, canvas);
  updateStarfield(dt, starField);
  checkCollisions();
}

function updateEntities(dt, canvas) {
  State.player.sprite.update(dt);

  State.explosions.forEach(function (explosion, index) {
    explosion.sprite.update(dt);

    if (explosion.sprite.done) {
      State.explosions.splice(index, 1);
    }
  });

  State.playerBullets.forEach(function (bullet, index) {
    bullet.pos[1] -= playerBulletSpeed * dt;

    if (bullet.pos[1] < 0 - bullet.sprite.size[1]) {
      State.playerBullets.splice(index, 1);
    }

    bullet.sprite.update(dt);
  });

  State.enemyBullets.forEach(function (bullet, index) {
    bullet.pos[1] += enemyBulletSpeed * dt;

    if (bullet.pos[1] < canvas.height - bullet.sprite.size[1]) {
      State.playerBullets.splice(index, 1);
    }

    bullet.sprite.update(dt);
  });

  State.enemies.forEach(function (enemy) {
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

function collides(x, y, r, b, x2, y2, r2, b2) {
  return !(r <= x2 || x > r2 ||
           b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
  return collides(pos[0], pos[1],
                  pos[0] + size[0], pos[1] + size[1],
                  pos2[0], pos2[1],
                  pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
  State.enemyBullets.forEach(function (bullet, bulletIndex) {
    var playerPos = State.player.pos,
        playerSize = [State.player.sprite.size[0] - 20,
                      State.player.sprite.size[1] - 20],
        bulletPos = bullet.pos,
        bulletSize = [bullet.sprite.size[0] - 20, bullet.sprite.size[1] - 20];

    if (boxCollides(playerPos, playerSize, bulletPos, bulletSize)) {
      State.explosions.push({
        pos: playerPos,
        sprite: new Sprite('img/explosion.png',
                           [0, 0],
                           [50, 105],
                           17,
                           [
                             0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                             13, 14, 15, 16, 17
                           ],
                           null,
                           true)
      });
      State.enemyBullets.splice(bulletIndex, 1);
      gameOver();
    }
  });

  State.enemies.forEach(function (enemy, enemyIndex) {
      var enemyPos = enemy.pos,
          enemySize = enemy.sprite.size;

      State.playerBullets.forEach(function (bullet, bulletIndex) {
        var bulletPos = bullet.pos,
            bulletSize = bullet.sprite.size;

        if (boxCollides(enemyPos, enemySize, bulletPos, bulletSize)) {
          State.explosions.push({
            pos: enemyPos,
            sprite: new Sprite('img/explosion.png',
                               [0, 0],
                               [50, 105],
                               17,
                               [
                                 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                                 13, 14, 15, 16, 17
                               ],
                               null,
                               true)
          });
          State.enemies.splice(enemyIndex, 1);
          State.playerBullets.splice(bulletIndex, 1);
          State.score += 100;
          document.getElementById('weapon-status-text').innerText = State.score;
        }
      });
  });
}

function handleInput(dt, canvas) {
  if (
      Key.isPressed('space') && Date.now() - State.lastFire > 500
    ) {
    var x = State.player.pos[0];
    var y = State.player.pos[1] - State.player.sprite.size[1] / 2;
    State.playerBullets.push({ pos: [x, y], sprite: new Sprite(
                           'img/fighter-bullet.png',
                           [0, 0],
                           [50, 120],
                           15,
                           [
                             0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                             9, 8, 7, 6, 5, 4, 3, 2, 1
                           ]
                         )
                      });

    State.lastFire = Date.now();
  }

  if (Key.isPressed('left') && State.player.pos[0] >= 0) {
    State.player.pos[0] -= playerSpeed * dt;

    if (State.playerDirection === 'center') {
      State.playerDirection = 'incomplete';

      State.player.sprite = new Sprite(
        'img/fighter.png',
        [0, 0],
        [50, 135],
        15,
        [4, 3, 2, 1, 0],
        null,
        null,
        function () {
          State.playerDirection = 'left';
        }
      );
    } else if (State.playerDirection === 'right') {
      State.playerDirection = 'incomplete';

      State.player.sprite = new Sprite(
        'img/fighter.png',
        [0, 0],
        [50, 135],
        15,
        [9, 8, 7, 6, 5],
        null,
        null,
        function () {
          State.playerDirection = 'center';
        }
      );
    }
  } else if (
      Key.isPressed('right') &&
      State.player.pos[0] <= canvas.width - State.player.sprite.size[0]
    ) {
    State.player.pos[0] += playerSpeed * dt;

    if (State.playerDirection === 'center') {
      State.playerDirection = 'incomplete';

      State.player.sprite = new Sprite(
        'img/fighter.png',
        [0, 0],
        [50, 135],
        15,
        [6, 7, 8, 9, 10],
        null,
        null,
        function () {
          State.playerDirection = 'right';
        }
      );
    } else if (State.playerDirection === 'left') {
      State.playerDirection = 'incomplete';

      State.player.sprite = new Sprite(
        'img/fighter.png',
        [0, 0],
        [50, 135],
        15,
        [1, 2, 3, 4, 5],
        null,
        null,
        function () {
          State.playerDirection = 'center';
        }
      );
    }
  } else if (Key.getPressedKeyCodes().length === 0) {
    if (State.playerDirection === 'left') {
      State.playerDirection = 'incomplete';

      State.player.sprite = new Sprite(
        'img/fighter.png',
        [0, 0],
        [50, 135],
        15,
        [1, 2, 3, 4, 5],
        null,
        null,
        function () {
          State.playerDirection = 'center';
        }
      );
    } else if (State.playerDirection === 'right') {
      State.playerDirection = 'incomplete';

      State.player.sprite = new Sprite(
        'img/fighter.png',
        [0, 0],
        [50, 135],
        15,
        [9, 8, 7, 6, 5],
        null,
        null,
        function () {
          State.playerDirection = 'center';
        }
      );
    }
  }
}

function gameOver() {
  document.getElementById('game-over').style.display = 'block';
  document.getElementById('game-over-overlay').style.display = 'block';
  State.player.pos = [1000, 1000];
}

function reset(canvas) {
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('game-over-overlay').style.display = 'none';
  document.getElementById('weapon-status-text').innerText = 'CHARGING';
  document.getElementById('weapon-status-text').style.color = 'red';

  State.gameTime = 0;
  State.score = 0;

  State.enemies = [];
  State.bullets = [];
  State.enemyBullets = [];

  State.player.pos = [256, 450];

  for (var i = 0; i < 10; i++) {
    State.enemies.push({
      pos: [Math.random() * canvas.width,
            Math.random() * (canvas.height - 300)],
      sprite: new Sprite(
        'img/ufos.png',
        [0, 0],
        [64, 64],
        20,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
      )
    });
  }
  setTimeout(function () {
    document.getElementById('weapon-status-text').innerText = 'READY';
    document.getElementById('weapon-status-text').style.color = 'green';
    State.lastFire = Date.now();
  }, 5000);
}
