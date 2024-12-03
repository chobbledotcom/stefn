const bg = document.getElementById("bg").getContext("2d");
const splatter = document.getElementById("splatter").getContext("2d");
const fg = document.getElementById("fg").getContext("2d");
const fx = document.getElementById("bombs").getContext("2d");
const overlay = document.getElementById("overlay").getContext("2d");
const debugText = document.getElementById("debug_text").getContext("2d");

[bg, splatter, fg, fx, overlay, debugText].forEach((l) => {
  l.height = 512;
  l.width = 512;
});

overlay.fillStyle = "white";

function isWall(x, y) {
  let yAvg = Math.floor(y / BLOCK_SIZE);
  let xAvg = Math.floor(x / BLOCK_SIZE);
  let row = currentLevel[yAvg];
  return ((row && row[xAvg]) || "1") !== "0";
}

function overlapping(obj1, obj2) {
  let horizontal = obj1.left <= obj2.right && obj2.left <= obj1.right;
  let vertical = obj1.top <= obj2.bottom && obj2.top <= obj1.bottom;
  return horizontal && vertical;
}

function calculateDistance(obj1, obj2) {
  let a = obj1.x - obj2.x;
  let b = obj1.y - obj2.y;
  return Math.sqrt(a * a + b * b) / BLOCK_SIZE;
}

const GAME_DURATION = 30;

let previousRemaining = null,
  previousScore = null,
  score = 0,
  highscore = null;

function renderScore() {
  let seconds = (Date.now() - lastGameStarted) / 1000;
  let remaining = GAME_DURATION - Math.floor(seconds);

  if (previousRemaining == remaining) return;

  previousRemaining = remaining;
  clearCanvas(overlay);

  overlay.font = "30px Sans-Serif";
  if (highscore) {
    overlay.fillText(`${score}`, 20, bg.height - 40);
    overlay.fillText(`top: ${highscore}`, 20, bg.height - 10);
  } else {
    overlay.fillText(`${score}`, 20, bg.height - 30);
  }

  if (remaining > GAME_DURATION - 5 && previousScore) {
    let minus = GAME_DURATION - remaining;
    let fontSize = 72 - minus * 4;
    let offset = 60 + minus * 5;
    overlay.font = `${fontSize}px Sans-Serif`;
    overlay.fillText(`you got ${previousScore}!`, offset, offset);
  } else if (remaining <= 0) {
    previousScore = score;
    if (score > highscore) highscore = score;
    score = 0;
    lastGameStarted = Date.now();
    restart();
  } else if (remaining < 10) {
    overlay.font = "60px Sans-Serif";
    overlay.fillText(remaining, overlay.width / 2, overlay.height / 2);
  }
}

let lastFrameRender = Date.now(),
  lastGameStarted = null,
  frameCount = 0;

const token = new Character(null, null, 20, 20, "yellow");

function restart() {
  let level = pickRandom(levels);
  lastGameStarted = Date.now();
  currentLevel = level.map((l) => l.split(""));
  token.resetPosition(5);

  explode(token);
  explode(player);
  baddies.forEach((b) => explode(b));

  baddies = [];
  debug;
  let colours = [
    "#2de2e6",
    "#035ee8",
    "#f6019d",
    "#d40078",
    "#9700cc",
    "#2de2e6",
    "#035ee8",
    "#f6019d",
    "#d40078",
    "#9700cc",
  ];
  for (let i = 0; i < colours.length; i++) {
    let baddy = new Baddy(null, null, 10, 10, colours[i], i);
    baddies.push(baddy);
    baddy.resetPosition(5);
  }
  drawLevel();
  main();
}

function main() {
  frameCount++;
  requestAnimationFrame(main);

  let fps = parseInt(document.getElementById("debug_fps").value) || 60;
  let fpsInterval = 1000 / fps;

  let now = Date.now();
  let elapsed = now - lastFrameRender;
  if (elapsed > fpsInterval) {
    lastFrameRender = now - (elapsed % fpsInterval);

    bombs.forEach((b) => b.tick());

    input();
    player.gravity();
    baddies.forEach((baddy) => baddy.move());

    if (overlapping(player, token)) {
      score += 20;
      explode(token);
      token.resetPosition(5);
    }

    baddies.forEach((baddy) => {
      if (overlapping(player, baddy)) {
        score--;
        explode(baddy);
        baddy.resetPosition(5);
      }
    });

    if (score < 0) score = 0;

    clearCanvas(fg);
    clearCanvas(fx);
    shiftCanvas(splatter);

    renderExplosions();
    bombs.forEach((b) => b.render());
    player.render();
    token.render();
    baddies.forEach((baddy) => baddy.render());
    renderScore();
    debug();
  }
}

function shiftCanvas(canvas) {
  canvas.putImageData(
    canvas.getImageData(0, -1, canvas.width, canvas.height - 1),
    0,
    0
  );
  canvas.clearRect(canvas.width, 0, -1, canvas.height - 1);
}

let currentLevel = null;
let baddies = [];
window.onload = function () {
  overlay.font = "30px Sans-Serif";
  overlay.fillText(`you are the white square!`, 20, 40);
  overlay.fillText(`yellow square: +20`, 20, 80);
  overlay.fillText(`bad guy: -1`, 20, 120);
  overlay.fillText(`move: wasd / arrows`, 20, 160);
  overlay.fillText(`bomb: space (-3)`, 20, 200);
  overlay.fillText(`rounds are 30 secs`, 20, 240);
  overlay.fillText(`starting in 10 secs!`, 20, 280);
  setTimeout(restart, 10000);
};
