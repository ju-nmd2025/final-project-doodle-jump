import Cat from "./character.js";
import Platform from "./platforms.js";
import Obstacle from "./obstacles.js";
import Effects from "./effects.js";

let cat;
let platforms = [];
let obstacles = [];
let particles = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let effects;

window.setup = function() {
  createCanvas(400, 600);
  textFont("Comic Sans MS");

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
      chooseObstacleType()
    ));
  }
}

window.draw = function() {
  // When the score reaches 100 the difficulty is the highest (1)
  // It can never be more difficult than that 1.
  difficulty = map(score, 0, 100, 0, 1, true);

  // Background gets darker when increasing difficulty
  let r = lerp(255, 115, difficulty);
  let g = lerp(209, 0, difficulty);
  let b = lerp(220, 75, difficulty);
  background(r, g, b);

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
  p.tryLand(cat, prevY + cat.h / 2);
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
  o.checkCollision(cat);
  o.draw();
  if (o.y > height + 40) o.recycle();
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

window.mouseClicked = function() {
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

window.keyPressed = function() {
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
    chooseObstacleType()
  ));
 }
}