class Baddy extends Character {
  baseSpeed = 1;
  ticksLeft = 0;
  stuckLeft = 5;
  previousDirection = null;
  render() {
    splatter.beginPath();
    splatter.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      0,
      Math.PI * 2
    );
    splatter.fillStyle = "black";
    splatter.fill();
    super.render();
  }
  speed() {
    let distanceFromPlayer = calculateDistance(this, player);
    if (distanceFromPlayer < 3) return this.baseSpeed * 3;
    if (distanceFromPlayer < 5) return this.baseSpeed * 2;
    return this.baseSpeed;
  }
  kill() {
    this.dead = Date.now();
    this.x = null;
    this.y = null;
  }
  move() {
    if (this.dead && Date.now() - this.dead > 2000) {
      this.dead = null;
      this.resetPosition(5);
    }

    if (this.x == null || this.y == null || this.dead) return;

    let speed = this.speed();
    if (calculateDistance(this, player) <= 5 && this.stuckLeft <= 0) {
      this.direction.x = this.x == player.x ? 0 : this.x > player.x ? -1 : 1;
      this.direction.y = this.y == player.y ? 0 : this.y > player.y ? -1 : 1;
      this.ticksLeft = 0;
    } else {
      if (this.ticksLeft <= 0) {
        this.direction = pickRandom(DIRECTIONS);
        this.ticksLeft = Math.ceil(10 * BLOCK_SIZE * Math.random());
      }
      this.ticksLeft -= 1;
      this.stuckLeft -= 1;
    }

    const oldX = this.x;
    this.x = oldX + this.direction.x * speed;
    const oldY = this.y;
    this.y = oldY + this.direction.y * speed;

    let stuck = false;
    if (
      isWall(this.left, this.top) ||
      isWall(this.right, this.top) ||
      isWall(this.left, this.bottom) ||
      isWall(this.right, this.bottom)
    ) {
      this.x = oldX;
      this.y = oldY;
      this.direction = pickRandom(DIRECTIONS);
      this.stuckLeft = 30;
      stuck = true;
    }

    if (stuck && Math.random() - 0.5 > 0.2) {
      explode(this);
    }

    // this.debugMessage = {
    //   x: this.direction.x,
    //   y: this.direction.y,
    //   s: speed,
    //   t: this.stuckLeft,
    //   r: this.ticksLeft,
    //   u: stuck,
    // };
  }
}

function pickRandom(array) {
  return array.sort(function (a, b) {
    return 0.5 - Math.random();
  })[0];
}
