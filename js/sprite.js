var Resources = require('./resources.js');

var Sprite = function(url, pos, size, speed, frames, dir, once, stickyOnce) {
  this.url = url;
  this.pos = pos;
  this.size = size;
  this.speed = typeof speed === 'number' ? speed : 0;
  this.frames = frames;
  this.dir = dir || 'horizontal';
  this.once = once;
  this.stickyOnce = stickyOnce;

  this._index = 0;
  this.orientation = 'left';
};

Sprite.prototype = {
  update: function(dt) {
    this._index += this.speed * dt;
  },

  render: function(ctx) {
    var max = this.frames.length,
        idx = Math.floor(this._index),
        frame;

    if (this.stickyOnce && idx >= max) {
      this.stickyOnce();
      frame = this.frames[this.frames.length - 1];
    } else if (this.speed > 0) {
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
