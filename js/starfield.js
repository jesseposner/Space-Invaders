var Starfield = function functionName() {
  this.width = 512;
  this.height = 600;
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
