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
	    Key = __webpack_require__(8),
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
	  this.orientation = 'left';
	};
	
	Sprite.prototype = {
	  update: function(dt) {
	    this._index += this.speed * dt;
	  },
	
	  render: function(ctx) {
	    var frame;
	
	    if (this.speed > 0) {
	      var max = this.frames.length;
	      var idx = Math.floor(this._index);
	      frame = this.frames[idx % max];
	
	      if (this.once && idx >= max) {
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


/***/ },
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	(function(global){var k,_handlers={},_mods={16:false,18:false,17:false,91:false},_scope="all",_MODIFIERS={"⇧":16,shift:16,"⌥":18,alt:18,option:18,"⌃":17,ctrl:17,control:17,"⌘":91,command:91},_MAP={backspace:8,tab:9,clear:12,enter:13,"return":13,esc:27,escape:27,space:32,left:37,up:38,right:39,down:40,del:46,"delete":46,home:36,end:35,pageup:33,pagedown:34,",":188,".":190,"/":191,"`":192,"-":189,"=":187,";":186,"'":222,"[":219,"]":221,"\\":220},code=function(x){return _MAP[x]||x.toUpperCase().charCodeAt(0)},_downKeys=[];for(k=1;k<20;k++)_MAP["f"+k]=111+k;function index(array,item){var i=array.length;while(i--)if(array[i]===item)return i;return-1}function compareArray(a1,a2){if(a1.length!=a2.length)return false;for(var i=0;i<a1.length;i++){if(a1[i]!==a2[i])return false}return true}var modifierMap={16:"shiftKey",18:"altKey",17:"ctrlKey",91:"metaKey"};function updateModifierKey(event){for(k in _mods)_mods[k]=event[modifierMap[k]]}function dispatch(event){var key,handler,k,i,modifiersMatch,scope;key=event.keyCode;if(index(_downKeys,key)==-1){_downKeys.push(key)}if(key==93||key==224)key=91;if(key in _mods){_mods[key]=true;for(k in _MODIFIERS)if(_MODIFIERS[k]==key)assignKey[k]=true;return}updateModifierKey(event);if(!assignKey.filter.call(this,event))return;if(!(key in _handlers))return;scope=getScope();for(i=0;i<_handlers[key].length;i++){handler=_handlers[key][i];if(handler.scope==scope||handler.scope=="all"){modifiersMatch=handler.mods.length>0;for(k in _mods)if(!_mods[k]&&index(handler.mods,+k)>-1||_mods[k]&&index(handler.mods,+k)==-1)modifiersMatch=false;if(handler.mods.length==0&&!_mods[16]&&!_mods[18]&&!_mods[17]&&!_mods[91]||modifiersMatch){if(handler.method(event,handler)===false){if(event.preventDefault)event.preventDefault();else event.returnValue=false;if(event.stopPropagation)event.stopPropagation();if(event.cancelBubble)event.cancelBubble=true}}}}}function clearModifier(event){var key=event.keyCode,k,i=index(_downKeys,key);if(i>=0){_downKeys.splice(i,1)}if(key==93||key==224)key=91;if(key in _mods){_mods[key]=false;for(k in _MODIFIERS)if(_MODIFIERS[k]==key)assignKey[k]=false}}function resetModifiers(){for(k in _mods)_mods[k]=false;for(k in _MODIFIERS)assignKey[k]=false}function assignKey(key,scope,method){var keys,mods;keys=getKeys(key);if(method===undefined){method=scope;scope="all"}for(var i=0;i<keys.length;i++){mods=[];key=keys[i].split("+");if(key.length>1){mods=getMods(key);key=[key[key.length-1]]}key=key[0];key=code(key);if(!(key in _handlers))_handlers[key]=[];_handlers[key].push({shortcut:keys[i],scope:scope,method:method,key:keys[i],mods:mods})}}function unbindKey(key,scope){var multipleKeys,keys,mods=[],i,j,obj;multipleKeys=getKeys(key);for(j=0;j<multipleKeys.length;j++){keys=multipleKeys[j].split("+");if(keys.length>1){mods=getMods(keys)}key=keys[keys.length-1];key=code(key);if(scope===undefined){scope=getScope()}if(!_handlers[key]){return}for(i=0;i<_handlers[key].length;i++){obj=_handlers[key][i];if(obj.scope===scope&&compareArray(obj.mods,mods)){_handlers[key][i]={}}}}}function isPressed(keyCode){if(typeof keyCode=="string"){keyCode=code(keyCode)}return index(_downKeys,keyCode)!=-1}function getPressedKeyCodes(){return _downKeys.slice(0)}function filter(event){var tagName=(event.target||event.srcElement).tagName;return!(tagName=="INPUT"||tagName=="SELECT"||tagName=="TEXTAREA")}for(k in _MODIFIERS)assignKey[k]=false;function setScope(scope){_scope=scope||"all"}function getScope(){return _scope||"all"}function deleteScope(scope){var key,handlers,i;for(key in _handlers){handlers=_handlers[key];for(i=0;i<handlers.length;){if(handlers[i].scope===scope)handlers.splice(i,1);else i++}}}function getKeys(key){var keys;key=key.replace(/\s/g,"");keys=key.split(",");if(keys[keys.length-1]==""){keys[keys.length-2]+=","}return keys}function getMods(key){var mods=key.slice(0,key.length-1);for(var mi=0;mi<mods.length;mi++)mods[mi]=_MODIFIERS[mods[mi]];return mods}function addEvent(object,event,method){if(object.addEventListener)object.addEventListener(event,method,false);else if(object.attachEvent)object.attachEvent("on"+event,function(){method(window.event)})}addEvent(document,"keydown",function(event){dispatch(event)});addEvent(document,"keyup",clearModifier);addEvent(window,"focus",resetModifiers);var previousKey=global.key;function noConflict(){var k=global.key;global.key=previousKey;return k}global.key=assignKey;global.key.setScope=setScope;global.key.getScope=getScope;global.key.deleteScope=deleteScope;global.key.filter=filter;global.key.isPressed=isPressed;global.key.getPressedKeyCodes=getPressedKeyCodes;global.key.noConflict=noConflict;global.key.unbind=unbindKey;if(true)module.exports=assignKey})(this);

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map