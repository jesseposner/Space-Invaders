/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Resources = __webpack_require__(1),
	    State = __webpack_require__(2),
	    Sprite = __webpack_require__(3),
	    Starfield = __webpack_require__(4),
	    enemySpeed = 100;
	
	document.addEventListener("DOMContentLoaded", function () {
	  var canvas = document.createElement("canvas");
	  var ctx = canvas.getContext("2d");
	  canvas.width = 512;
	  canvas.height = 480;
	  document.body.appendChild(canvas);
	
	  Resources.load([
	    'img/ufos.png'
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
	
	  updateEntities(dt);
	  updateStarfield(dt, starField);
	
	  if (Math.random() < .02) {
	    State.enemies.push({
	      pos: [canvas.width,
	            Math.random() * (canvas.height - 39)],
	      sprite: new Sprite('img/ufos.png', [0, 0], [64.7, 64],
	                         20, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
	    });
	  }
	}
	
	function updateEntities(dt) {
	  State.enemies.forEach(function functionName(enemy, index) {
	    enemy.pos[0] -= enemySpeed * dt;
	    enemy.sprite.update(dt);
	
	    if(enemy.pos[0] + enemy.sprite.size[0] < 0) {
	      State.enemies.splice(index, 1);
	    }
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];
	
	function _load(url) {
	  if (resourceCache[url]) {
	   return resourceCache[url];
	  } else {
	   var img = new Image();
	   img.onload = function() {
	     resourceCache[url] = img;
	
	     if(Resources.isReady()) {
	       readyCallbacks.forEach(function(func) { func(); });
	     }
	   };
	   resourceCache[url] = false;
	   img.src = url;
	  }
	}
	
	var Resources = {
	  // Load an image url or an array of image urls
	  load: function(urlOrArr) {
	    if (urlOrArr instanceof Array) {
	      urlOrArr.forEach(function(url) {
	        _load(url);
	      });
	    } else {
	      _load(urlOrArr);
	    }
	  },
	
	  get: function(url) {
	    return resourceCache[url];
	  },
	
	  isReady: function() {
	    var ready = true;
	    for (var k in resourceCache) {
	      if(resourceCache.hasOwnProperty(k) &&
	         !resourceCache[k]) {
	          ready = false;
	      }
	    }
	    return ready;
	  },
	
	  onReady: function(func) {
	    readyCallbacks.push(func);
	  }
	};
	
	module.exports = Resources;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Sprite = __webpack_require__(3);
	
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Resources = __webpack_require__(1);
	
	var Sprite = function(url, pos, size, speed, frames, dir, once) {
	  this.pos = pos;
	  this.size = size;
	  this.speed = typeof speed === 'number' ? speed : 0;
	  this.frames = frames;
	  this._index = 0;
	  this.url = url;
	  this.dir = dir || 'horizontal';
	  this.once = once;
	};
	
	Sprite.prototype = {
	  update: function(dt) {
	    this._index += this.speed * dt;
	  },
	
	  render: function(ctx) {
	    var frame;
	
	    if(this.speed > 0) {
	      var max = this.frames.length;
	      var idx = Math.floor(this._index);
	      frame = this.frames[idx % max];
	
	      if(this.once && idx >= max) {
	       this.done = true;
	       return;
	      }
	
	    } else {
	     frame = 0;
	    }
	
	    var x = this.pos[0];
	    var y = this.pos[1];
	
	    if (this.dir === 'vertical') {
	      y += frame * this.size[1];
	    }
	    else {
	      x += frame * this.size[0];
	    }
	
	    ctx.drawImage(
	      Resources.get(this.url),
	      x, y,
	      this.size[0], this.size[1],
	      0, 0,
	      this.size[0], this.size[1]
	    );
	  }
	};
	
	module.exports = Sprite;


/***/ },
/* 4 */
/***/ function(module, exports) {

	var Starfield = function functionName() {
	  this.width = 512;
	  this.height = 480;
	  this.minVelocity = 15;
	  this.maxVelocity = 30;
	  this.starCount = 100;
	  this.stars = [];
	  this.Star = function (x, y, size, velocity) {
	    this.x = x;
	    this.y = y;
	    this.size = size;
	    this.velocity = velocity;
	  };
	
	  for (var i = 0; i < this.starCount; i++) {
	    this.stars.push(
	      new this.Star(
	        Math.random() * this.width,
	        Math.random() * this.height,
	       (Math.random() * 3) + 1,
	       (Math.random() * (this.maxVelocity - this.minVelocity)) +
	          this.minVelocity
	      )
	    );
	  }
	};
	
	module.exports = Starfield;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map