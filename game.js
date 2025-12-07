let cat;
let platforms = [];
let obstacles = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;

function setup() {
  createCanvas(400, 600);
  textFont("Comic Sans MS");

  const saved = localStorage.getItem("catCloudHighScore");
  if (saved) highScore = parseInt(saved);

  resetGame();
}

function resetGame() {
  // Cat head is 55px across — keep w/h in sync for collisions
  cat = { x: width / 2, y: height - 120, w: 55, h: 55, vy: -8 };

  platforms = [];
  for (let i = 0; i < 6; i++) {
    platforms.push({
      x: random(0, width - 80),
      y: i * 100,
      w: 80,
      h: 20,
      dx: random([-1, 1]) * random(0.5, 1.2),
      moving: random() < 0.4,
    });
  }

  obstacles = [];
  for (let i = 0; i < 2; i++) {
    obstacles.push({
      x: random(40, width - 40),
      y: random(140, height - 240),
      size: 30,
      dx: random([-1, 1]) * 1.4,
      type: random(["balloon", "star"]),
    });
  }

  score = 0;
  gameOver = false;
}

function draw() {
  background("#ffd1dc ");

  if (!gameStarted) {
    drawStartScreen();
    return;
  }
  if (gameOver) {
    drawGameOver();
    return;
  }

  handleKeyboard();

  //remember cats position before moving
  let prevY = cat.y;

  // Gravity
  cat.vy += 0.3;
  cat.y += cat.vy;

  // Platforms update + cat landing
  for (let p of platforms) {
    if (p.moving) {
      p.x += p.dx;
      if (p.x < 0 || p.x + p.w > width) p.dx *= -1;
    }

    const catLeft = cat.x - cat.w / 2;
    const catRight = cat.x + cat.w / 2;
    const catTop = cat.y - cat.h / 2;
    const catBottom = cat.y + cat.h / 2;
    const prevBottom = prevY + cat.h / 2;

    if (
      catLeft < p.x + p.w &&
      catRight > p.x &&
      prevBottom <= p.y &&
      catBottom >= p.y &&
      cat.vy > 0
    ) {
      cat.y = p.y - cat.h / 2;
      cat.vy = -10;
      score++;
    }
  }

  // Camera: keep cat around y=300, move world down
  if (cat.y < 300) {
    const dy = 300 - cat.y;
    cat.y = 300;
    for (let p of platforms) p.y += dy;
    for (let o of obstacles) o.y += dy;
  }

  // Recycle platforms
  for (let p of platforms) {
    if (p.y > height) {
      p.x = random(0, width - p.w);
      p.y = 0;
      p.dx = random([-1, 1]) * random(0.5, 1.2);
      p.moving = random() < 0.4;
    }
  }

  //Recycle obstacles
  for (let o of obstacles) {
    if (o.y > height + 40) {
      o.x = random(40, width - 40);
      o.y = random(-200, 0);
      o.dx = random([-1, 1]) * 1.4;
      o.type = random(["balloon", "star"]);
    }
  }

  // Obstacles movement + collision
  for (let o of obstacles) {
    o.x += o.dx;
    if (o.x < 20 || o.x > width - 20) o.dx *= -1;

    // Round hit test: cat head circle vs obstacle circleish
    const d = dist(cat.x, cat.y, o.x, o.y);
    if (d < o.size / 2 + cat.w / 2 - 5) {
      gameOver = true;
    }
  }

  // Draw platforms, obstacles and cat
  for (let p of platforms) drawCloud(p.x, p.y, p.w);
  for (let o of obstacles) drawObstacle(o);
  drawCuteCat(cat.x, cat.y);

  // HUD
  fill("#ff1493");
  textSize(20);
  textAlign(LEFT);
  text("Score: " + score, 10, 30);

  // Fail if falls off
  if (cat.y - cat.h / 2 > height) gameOver = true;

  // Keep cat within canvas
  cat.x = constrain(cat.x, cat.w / 2, width - cat.w / 2);
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
 
// Purple cat
function drawCuteCat(x, y) {
  // Head
  fill("#d8baff"); // light purple
  ellipse(x, y, 55, 55);

  // Ears
  fill("#c8a2ff");
  triangle(x - 22, y - 10, x - 12, y - 35, x - 2, y - 10);
  triangle(x + 22, y - 10, x + 12, y - 35, x + 2, y - 10);

  // Eyes
  fill(255);
  ellipse(x - 14, y - 5, 14, 14);
  ellipse(x + 14, y - 5, 14, 14);
  fill(0);
  ellipse(x - 14, y - 5, 7, 7);
  ellipse(x + 14, y - 5, 7, 7);
  fill(255);
  ellipse(x - 12, y - 7, 3, 3);
  ellipse(x + 16, y - 7, 3, 3);

  // Nose + mouth
  fill("#ff69b4");
  triangle(x - 3, y + 5, x + 3, y + 5, x, y + 10);
  stroke(0);
  strokeWeight(1.5);
  noFill();
  arc(x - 3, y + 12, 6, 6, 0, PI);
  arc(x + 3, y + 12, 6, 6, 0, PI);
  noStroke();

  // Blush
  fill("#dda0dd");
  ellipse(x - 20, y + 10, 8, 6);
  ellipse(x + 20, y + 10, 8, 6);

  // Whiskers
  stroke(0);
  line(x - 25, y + 5, x - 40, y + 3);
  line(x - 25, y + 10, x - 40, y + 12);
  line(x + 25, y + 5, x + 40, y + 3);
  line(x + 25, y + 10, x + 40, y + 12);
  noStroke();
}

// Obstacles: balloons and stars
function drawObstacle(o) {
  push();
  translate(o.x, o.y);

  if (o.type === "balloon") {
    // Balloon body
    fill("#d1edffff");
    ellipse(0, 0, o.size + 8, o.size + 10);
    // Tie
    fill("blue");
    triangle(-4, o.size / 2 - 2, 4, o.size / 2 - 2, 0, o.size / 2 + 6);
    // String
    stroke(180);
    noFill();
    beginShape();
    for (let t = 0; t < 12; t++) {
      vertex(sin(t * 0.5) * 2, o.size / 2 + 6 + t * 3);
    }
    endShape();
    noStroke();
    // face
    fill(0);
    ellipse(-5, -3, 3, 3);
    ellipse(5, -3, 3, 3);
    stroke(0);
    noFill();
    arc(0, 3, 8, 5, 0, PI);
    noStroke();
  } else {
    // Star
    fill("#fff4a3"); // soft yellow
    star(0, 0, o.size / 2 - 4, o.size / 2 + 2, 5);
    // Cute face
    fill(0);
    ellipse(-5, -3, 3, 3);
    ellipse(5, -3, 3, 3);
    stroke(0);
    noFill();
    arc(0, 3, 8, 5, 0, PI);
    noStroke();
  }

  pop();
}

// Draw a star
function star(x, y, r1, r2, n) {
  beginShape();
  for (let i = 0; i < n * 2; i++) {
    const angle = (PI * i) / n;
    const r = i % 2 === 0 ? r2 : r1;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);
}

// Cloud platforms
function drawCloud(x, y, w) {
  fill(255);
  stroke(200);
  strokeWeight(1);
  ellipse(x + 20, y + 10, 40, 30);
  ellipse(x + w / 2, y + 10, 50, 35);
  ellipse(x + w - 20, y + 10, 40, 30);
  noStroke();
}
