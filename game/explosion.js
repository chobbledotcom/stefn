let explosions = [];
let explosionPoints = [];

class Explosion {
  animationDuration = 1000;
  constructor(x, y, color) {
    this.startX = this.x = x;
    this.startY = this.y = y;
    this.color = color;
    this.speed = {
      x: -5 + Math.random() * 10,
      y: -5 + Math.random() * 10,
    };
    this.radius = 5 + Math.random() * 5;
    this.life = 30 + Math.random() * 10;
    this.remainingLife = this.life;
    this.startTime = Date.now();
    explosions.push(this);
  }
  render() {
    if (this.remainingLife > 0 && this.radius > 0) {
      fx.beginPath();
      fx.arc(this.startX, this.startY, this.radius, 0, Math.PI * 2);
      fx.fillStyle = this.color;
      fx.fill();

      if (Math.random() - 0.5 > 0.2) {
        splatter.beginPath();
        splatter.arc(this.startX, this.startY, this.radius, 0, Math.PI * 2);
        splatter.fillStyle = this.color;
        splatter.fill();
      }

      // Update the particle's location and life
      this.remainingLife--;
      this.radius -= 0.25;
      this.startX += this.speed.x;
      this.startY += this.speed.y;
    }
  }
}

function explode(character) {
  for (let i = 0; i < (character.width * character.height) / 5; i++) {
    new Explosion(character.x, character.y, character.color);
  }
}

function renderExplosions() {
  for (let i = 0; i < explosions.length; i++) {
    explosions[i].render();
    // Simple way to clean up if the last particle is done animating
    if (i === explosions.length - 1) {
      let percent =
        (Date.now() - explosions[i].startTime) /
        explosions[i].animationDuration;
      if (percent > 1) {
        explosions = [];
      }
    }
  }
}
