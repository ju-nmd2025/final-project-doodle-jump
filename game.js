import Cat from "./character.js";
import Obstacle, { chooseObstacleType } from "./obstacles.js";
import Platform from "./platforms.js";
import Effects from "./effects.js";

let cat;
let platforms = [];
let obstacles = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let effects;
let difficulty = 0;

function setup() {
  createCanvas(400, 600);
  textFont("Comic Sans MS");

  effects = new Effects();

  const saved = localStorage.getItem("catCloudHighScore");
  if (saved) highScore = parseInt(saved);

  resetGame();
}

function resetGame() {
  // Cat head is 55px across — keep w/h in sync for collisions
  cat = new Cat(width / 2, height -120);
  effects.reset();
  difficulty = 0;
  score = 0;
  gameOver = false;

  platforms = [];
  for (let i = 0; i < 6; i++) {
    let breakingPlatform = random() < 0.2;
    let moving = random() < 0.4;
    let dx = random([-1, 1]) * random(0.5, 1.2);

    platforms.push(
      new Platform(
        random(0, width - 80),
        i * 100, 
        80,
        moving,
        dx,
        breakingPlatform
      )
    );
  }


  obstacles = [];
  for (let i = 0; i < 2; i++) {
    obstacles.push(new Obstacle(
      random(40, width - 40),
      random(140, height -240),
      chooseObstacleType(obstacles)
    ));
  }
}

function draw() {
  difficulty = map(score, 0, 50, 0, 1, true);

  // Define pastel sunset stops
  let c1 = color("#ffd1dc "); // pastel pink
  let c2 = color(255, 183, 197); // pink
  let c3 = color(255, 223, 186); // peach/apricot
  let c4 = color(200, 170, 255); // lavender
  let c5 = color(180, 220, 255); // baby blue

  // Blend across multiple stops
  let col;
  if (difficulty < 0.33) {
    col = lerpColor(c1, c2, difficulty / 0.33); // pink → peach
  } else if (difficulty < 0.66) {
    col = lerpColor(c2, c3, (difficulty - 0.33) / 0.33); // peach → lavender
  } else {
    col = lerpColor(c3, c4, (difficulty - 0.66) / 0.34); // lavender → blue
  }

  background(col);

  if (!gameStarted) {
    drawStartScreen();
    return;
  }
  if (gameOver) {
    drawGameOver();
    return;
  }

  handleKeyboard();

  // Remember cats position before moving
  let prevY = cat.y;

  // Gravity
  if(gameStarted){
    cat.updateGravity();
  }

  for (let p of platforms) {
  p.update();

  const result = p.tryLand(cat, prevY + cat.h / 2);

  if (result.landed) {
    if (result.scored) score++;

    effects.createSparkles(cat.x, cat.y);

    if (result.broke) {
      effects.createRaindrops(p);
    }
  }
}

  // Camera: keep cat around y=300, move world down
  const dy = cat.applyCamera();
  if (dy > 0) {
    for (let p of platforms) p.y += dy;
    for (let o of obstacles) o.y += dy;
    effects.applyCameraShift(dy);

  }

  let minY = height;
  for (let p of platforms) {
    if (p.y < minY) minY = p.y;
  }

  for (let p of platforms) {
    if (p.y > height) {
      p.recycle(minY);
    }
  }

  for (let o of obstacles) {
  o.update();

  const result = o.checkCollision(cat);
  if (result === "rainbow") {
    score += 5;
    cat.vy = -15;
    effects.createSparkles(cat.x, cat.y);
    o.y = height + 50; // recycle immediately (same as before)
  } else if (result === "hit") {
    gameOver = true;
  }

  o.draw();

  if (o.y > height + 40) o.recycle(obstacles);
}

  // Increase difficulty as score rises
  updateDifficulty();

  // Draw platforms, obstacles and cat
  for (let p of platforms) p.draw();
  cat.draw();

  // HUD
  fill("#ff1493");
  textSize(20);
  textAlign(LEFT);
  text("Score: " + score, 10, 30);

  // Fail if falls off
  if (cat.y - cat.h / 2 > height) gameOver = true;

  // Keep cat within canvas
  cat.keepInsideCanvas();

  effects.updateRaindrops();
  effects.updateSparkles();
}

function drawStartScreen() {
  fill("#ff1493");
  textSize(32);
  textAlign(CENTER);
  text(" Cat Cloud Jump ^._.^", width / 2, height / 2 - 60);
  textSize(18);
  text("Use arrow keys to move", width / 2, height / 2 - 30);

  // Start button
  fill("#ff69b4");
  rect(width / 2 - 55, height / 2, 110, 42, 12);
  fill(255);
  textSize(18);
  text("Start", width / 2, height / 2 + 27);
}

function drawGameOver() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("catCloudHighScore", highScore);
  }

  fill("#ff1493");
  textSize(32);
  textAlign(CENTER);
  text("Game Over!", width / 2, height / 2 - 60);
  textSize(20);
  text("Score: " + score, width / 2, height / 2 - 20);
  text("High Score: " + highScore, width / 2, height / 2 + 8);
  text("Press SPACE to restart", width / 2, height / 2 + 40);
}

function handleKeyboard() {
  if (keyIsDown(LEFT_ARROW)) {
    cat.x -= 8;
    cat.y += sin(frameCount * 0.2);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    cat.x += 8;
    cat.y += sin(frameCount * 0.2);
  }
}

function mouseClicked() {
  // Start button hit test
  if (
    !gameStarted &&
    mouseX > width / 2 - 55 &&
    mouseX < width / 2 + 55 &&
    mouseY > height / 2 &&
    mouseY < height / 2 + 42
  ) {
    gameStarted = true;
  } else if (gameOver) {
    resetGame();
    gameStarted = true;
  }
}

function keyPressed() {
  if (gameOver && key === " ") {
    resetGame();
    gameStarted = true;
  }
}

function updateDifficulty() {
  // difficulty already goes from 0 → 1 as score increases
  const d = difficulty;

  for (let p of platforms) {
    if (p.moving) {
      const dir = p.dx >= 0 ? 1 : -1;
      const baseSpeed = 0.5;
      const extraSpeed = d * 1.0;
      p.dx = dir * (baseSpeed + extraSpeed);
    }

    p.w = 80 - d * 20;
  }

  for (let o of obstacles) {
    const dir = o.dx >= 0 ? 1 : -1;
    const baseSpeed = 0.6;
    const extraSpeed = d * 1.8; 
    o.dx = dir * (baseSpeed + extraSpeed);
  }

  const targetObstacles = min(2 + floor(score / 20), 5);

  while (obstacles.length < targetObstacles) {
    obstacles.push(new Obstacle(
    random(40, width - 40),
    random(-200, 0),
    chooseObstacleType(obstacles)
  ));
 }
}
