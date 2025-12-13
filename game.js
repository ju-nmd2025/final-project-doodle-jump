let cat;
let platforms = [];
let obstacles = [];
let particles = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let boostJump = false;
let difficulty = 0;
let raindrops = [];

function chooseObstacleType() {
  // Check if a rainbow already exists
  let rainbowExists = obstacles.some((o) => o.type === "rainbow");

  if (rainbowExists) {
    // Only allow balloon or star if rainbow is already on screen
    return random([
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "star",
      "star",
      "star",
      "star",
      "star",
      "star",
      "star",
      "star",
    ]);
  } else {
    // Weighted choice including rare rainbow
    let types = [
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "balloon",
      "star",
      "star",
      "star",
      "star",
      "star",
      "star",
      "star",
      "star",
      "rainbow",
      "rainbow",
    ];
    return random(types);
  }
}

class Cat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 55;
    this.h = 55;
    this.vy = -8;
  }

  updateGravity() {
    this.vy += 0.3;
    this.y += this.vy;
  }

  applyCamera() {
    if (this.y < 300) {
      const dy = 300 - this.y;
      this.y = 300;
      return dy;
    }
    return 0;
  }

  keepInsideCanvas() {
    this.x = constrain(this.x, this.w / 2, width - this.w /2);
  }

  draw() {
    drawCuteCat(this.x, this.y);
  }
}

class Platform {
  constructor(x, y, w, moving, dx, breaking) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = 20;
    this.moving = moving; 
    this.dx = dx;
    this.scored = false;
    this.breaking = breaking; 
    this.broken = false;
  }

  update() {
    if (this.moving) {
      this.x += this.dx;
      if (this.x < 0 || this.x + this.w > width) {
        this.dx *= -1;
      }
    }

    if (this.broken) {
      this.y += 8;
    }
  }

  tryLand(cat, prevBottom) {
    if (this.broken) return false;

    const catLeft =cat.x - cat.w / 2;
    const catRigth = cat.x + cat.w / 2;
    const catBottom = cat.y + cat.h/ 2; 

    if (
      catLeft < this.x + this.w &&
      catRigth > this.x && 
      prevBottom <= this.y &&
      catBottom >= this.y &&
      cat.vy > 0
    ) {
      cat.y = this.y - cat.h / 2;
      cat.vy = -10;

      if (!this.scored) {
        score++;
        this.scored = true;
      }

      createSparkles(cat.x, cat.y);

      if (this.breaking) {
        this.broken = true;
        createRaindrops(this);
      }

      return true;
    }

    return false;
  }

  recycle(minY) {
    this.x = random(0, width - this.w);

    // vertical distance between platforms
    const gapMin = 80;
    const gapMax = 140;

    this.y = minY - random(gapMin, gapMax);

    this.dx = random([-1, 1]) * random(0.5, 1.2);
    this.moving = random() < 0.4;
    this.scored = false;
    this.breaking = random() < 0.2;
    this.broken = false;
  }

  draw() {
    if (this.broken) return; 

    if (this.breaking) {
      fill(2);
      stroke(130);
    } else {
      fill(255);
      stroke(200);
    }

    strokeWeight(1);
    ellipse(this.x + 20, this.y + 10, 40, 30);
    ellipse(this.x + this.w / 2, this.y + 10, 50, 35);
    ellipse(this.x + this.w - 20, this.y + 10, 40, 30);
    noStroke();
  }
}

function setup() {
  createCanvas(400, 600);
  textFont("Comic Sans MS");

  const saved = localStorage.getItem("catCloudHighScore");
  if (saved) highScore = parseInt(saved);

  resetGame();
}

function resetGame() {
  // Cat head is 55px across — keep w/h in sync for collisions
  cat = new Cat(width / 2, height -120);
  particles = [];
  raindrops = [];
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
    obstacles.push({
      x: random(40, width - 40),
      y: random(140, height - 240),
      size: 30,
      dx: random([-1, 1]) * (0.4 + difficulty * 2),
      type: chooseObstacleType(),
    });
  }
}

function draw() {
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
  cat.updateGravity();

 for (let p of platforms) {
  p.update();
  p.tryLand(cat, prevY + cat.h / 2);
 }

  // Camera: keep cat around y=300, move world down
  const dy = cat.applyCamera();
  if (dy > 0) {
    for (let p of platforms) p.y += dy;
    for (let o of obstacles) o.y += dy;
    for (let pa of particles) pa.y += dy;
    for (let d of raindrops) d.y += dy;
  }

// Recycle platforms
// Find the highest (smallest y) platform
  let minY = height;
  for (let p of platforms) {
    if (p.y < minY) minY = p.y;
  }

  // Recycle platforms that go off the bottom
  for (let p of platforms) {
    if (p.y > height) {
      p.recycle(minY);
    }
  }

  //Recycle obstacles
  for (let o of obstacles) {
    if (o.y > height + 40) {
      o.x = random(40, width - 40);
      o.y = random(-200, 0);
      o.dx = random([-1, 1]) * 0.9;
      o.type = chooseObstacleType();
    }
  }

  // Obstacles movement + collision
  for (let o of obstacles) {
    o.x += o.dx;
    if (o.x < 20 || o.x > width - 20) o.dx *= -1;

    // Round hit test: cat head circle vs obstacle circleish
    const d = dist(cat.x, cat.y, o.x, o.y);

    if (o.type === "rainbow") {
      if (d < o.size / 2 + cat.w / 2) {
        // Bonus effect
        score += 5; // extra points
        cat.vy = -15; // super bounce
        createSparkles(cat.x, cat.y); // celebratory sparkles
        o.y = height + 50; // recycle rainbow immediately
      }
    } else {
      if (d < o.size / 2 + cat.w / 2 - 5) {
        gameOver = true; // balloons and stars still end the game
      }
    }
  }

  // Increase difficulty as score rises
  updateDifficulty();

  // Draw platforms, obstacles and cat
  for (let p of platforms) p.draw();
  for (let o of obstacles) drawObstacle(o);
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

  updateRaindrops();
  updateSparkles();
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

function createSparkles(x, y) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, -0.5),
      life: 60, // frames until fade
      size: random(3, 6),
      color: color(random(200, 255), random(150, 255), random(200, 255)),
    });
  }
}

function updateSparkles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05; // gravity
    p.life--;

    noStroke();
    fill(
      p.color.levels[0],
      p.color.levels[1],
      p.color.levels[2],
      map(p.life, 0, 60, 0, 255)
    );
    ellipse(p.x, p.y, p.size);

    if (p.life <= 0) particles.splice(i, 1);
  }
}

function createRaindrops(p) {
  for (let i = 0; i < 15; i++) {
    raindrops.push({
      x: p.x + random(10, p.w -10),
      y: p.y + 15,
      vy: random(4,7),
      len: random(8, 14)
    });
  }
}

function updateRaindrops() {
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let d = raindrops[i];
    d.y += d.vy;

    stroke(100, 150, 255, 220);
    strokeWeight(2);
    line(d.x, d.y, d.x, d.y + d.len);

    if (d.y > height + 20) {
      raindrops.splice(i, 1);
    }
  }
  noStroke();
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
    fill(color(209, 237, 255)); // pastel blue
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
    // Face
    fill(0);
    ellipse(-5, -3, 3, 3);
    ellipse(5, -3, 3, 3);
    stroke(0);
    noFill();
    arc(0, 3, 8, 5, 0, PI);
    noStroke();
  } else if (o.type === "star") {
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
  } else if (o.type === "rainbow") {
    // Rainbow arc
    noFill();
    strokeWeight(6);
    let colors = [
      "#ff0000",
      "#ff7f00",
      "#ffff00",
      "#00ff00",
      "#0000ff",
      "#4b0082",
      "#8b00ff",
    ];
    for (let i = 0; i < colors.length; i++) {
      stroke(colors[i]);
      arc(0, 0, o.size * 2 + i * 6, o.size + i * 4, PI, TWO_PI);
    }
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
function drawCloud(p) {

  if (p.broken) return;
  if (p.breaking) { //rainy clouds
    fill(2);
    stroke(130);
  } else { //normal clouds
    fill(255);
  stroke(200);
  }
  
  strokeWeight(1);
  ellipse(p.x + 20, p.y + 10, 40, 30);
  ellipse(p.x + p.w / 2, p.y + 10, 50, 35);
  ellipse(p.x + p.w - 20, p.y + 10, 40, 30);
  noStroke();
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
    obstacles.push({
      x: random(40, width - 40),
      y: random(-200, 0),
      size: 30,
      dx: random([-1, 1]) * (0.6 + d * 1.8),
      type: chooseObstacleType(),
    });
  }
}