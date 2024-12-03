let bombs = [];
let lastDropped = null;

class Bomb {
  radius = 0;
  constructor(x, y) {
    let now = Date.now();

    this.x = x;
    this.y = y;
    this.dropped = now;

    if (!lastDropped || now - lastDropped > 1000) {
      bombs.push(this);
      score -= 3;
      lastDropped = Date.now();
    }
  }
  tick() {
    this.radius += 6;
    if (this.radius >= 200) {
      bombs = bombs.filter((b) => b != this);
      return;
    }
    baddies.forEach((baddy) => {
      if (this.intersects(baddy)) {
        explode(baddy);
        baddy.kill();
        score += 1;
      }
    });
  }

  intersects(baddy) {
    let x = Math.abs(this.x - (baddy.x - baddy.width / 2));
    let y = Math.abs(this.y - (baddy.y - baddy.height / 2));

    if (x > baddy.width / 2 + this.radius) {
      return false;
    }

    if (y > baddy.height / 2 + this.radius) {
      return false;
    }

    if (x <= baddy.width / 2) {
      return true;
    }
    if (y <= baddy.height / 2) {
      return true;
    }

    let cornerDistance_sq =
      (x - baddy.width / 2) ^ (2 + (y - baddy.height / 2)) ^ 2;

    return cornerDistance_sq <= (this.radius ^ 2);
  }

  lightenDarkenColor(col, amt) {
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00ff) + amt;
    let g = (num & 0x0000ff) + amt;
    let newColor = g | (b << 8) | (r << 16);
    return newColor.toString(16);
  }

  drawCircle(radius, color) {
    fx.fillStyle = color;
    fx.beginPath();
    fx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    fx.closePath();
    fx.fill();
  }

  render() {
    for (let i = this.radius; i >= 5; i -= 5) {
      this.drawCircle(i, i % 2 == 0 ? "#2de2e6" : "#035ee8");
    }
  }
}
