const player = new Character(0, 0, 20, 20, "white");
player.isDoubleJumping = false;
player.lastTouchedGround = null;
player.pausedMidAirJump = null;

player.gravity = function () {
  this.y -= Math.floor(this.yke);

  let mass = keyDown(MOVEMENT_KEYS.down) ? this.mass * 4 : this.mass;
  let gravity = 9.8 / 1000000;
  let height = bg.height - this.height - this.y / BLOCK_SIZE;

  this.gpe = mass * gravity * height;
  this.yke -= this.gpe;

  let movement = this.movement();
  if (!movement.up) {
    if (this.yke >= 0) {
      this.yke = -0.5;
      this.y += 1;
    }
  } else {
    if (!movement.down) {
      this.lastTouchedGround = Date.now();
      this.isDoubleJumping = false;
      this.pausedMidAirJump = null;
      if (this.yke <= 0) {
        this.yke = 0;
        let newY = this.y + this.height;
        let bl = isWall(this.left, newY);
        let br = isWall(this.right, newY);
        if (bl || br) {
          this.y -= (this.y % BLOCK_SIZE) - (BLOCK_SIZE - this.height);
        }
      }
    }
  }
};

const MOVEMENT_KEYS = {
  left: ["ArrowLeft", "a"],
  right: ["ArrowRight", "d"],
  up: ["UpArrow", "w"],
  down: ["ArrowDown", "s"],
  fire: [" "],
};

const ALL_KEYS = [];
Object.keys(MOVEMENT_KEYS).forEach((key) => {
  MOVEMENT_KEYS[key].forEach((button) => {
    ALL_KEYS.push(button);
  });
});

let keysDown = {};
addEventListener("keydown", function (event) {
  if (!ALL_KEYS.includes(event.key)) return;
  event.preventDefault();
  keysDown[event.key] = true;
});

addEventListener("keyup", function (event) {
  if (!ALL_KEYS.includes(event.key)) return;
  if (
    !player.pausedMidAirJump &&
    player.yke != 0 &&
    MOVEMENT_KEYS.up.includes(event.key)
  ) {
    player.pausedMidAirJump = Date.now();
  }
  event.preventDefault();
  delete keysDown[event.key];
});

function keyDown(search) {
  return Object.keys(keysDown).filter((k) => search.includes(k)).length > 0;
}

function input() {
  let movingLeft = false,
    movingRight = false;

  const movement = player.movement();
  if (keyDown(MOVEMENT_KEYS.left)) {
    if (movement.left) {
      player.x -= player.speed("left", !movement.down, true);
      movingLeft = true;
    }
  } else if (keyDown(MOVEMENT_KEYS.right)) {
    if (movement.right) {
      player.x += player.speed("right", !movement.down, true);
      movingRight = true;
    }
  }

  if (keyDown(MOVEMENT_KEYS.fire)) {
    new Bomb(player.x, player.y);
  }

  if (!movingLeft) delete player.startedMovement.left;
  if (!movingRight) delete player.startedMovement.right;

  let up = keyDown(MOVEMENT_KEYS.up);
  let upLeft = isWall(player.left, player.top - 1);
  let upRight = isWall(player.right, player.top - 1);

  if (up && player.yke === 0) {
    if (!upLeft && !upRight) {
      player.yke += player.height / 3;
    }
  } else if (
    up &&
    player.lastTouchedGround &&
    Date.now() - player.lastTouchedGround > 300 &&
    player.pausedMidAirJump &&
    Date.now() - player.pausedMidAirJump > 100 &&
    !player.isDoubleJumping &&
    player.yke > -5 &&
    player.yke < 1
  ) {
    if (!upLeft && !upRight) {
      player.isDoubleJumping = true;
      player.pausedMidAirJump = null;
      player.yke += player.height / 3;
    }
  }
}
