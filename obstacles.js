export function chooseObstacleType(obstacles) {
  const rainbowExists = obstacles.some((o) => o.type === "rainbow");

  if (rainbowExists) {
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
      "rainbow",
      "rainbow",
    ]);
  }
}

export default class Obstacle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.type = type;
    this.dx = random([-1, 1]) * 0.9;
  }

  update() {
    this.x += this.dx;
    if (this.x < 20 || this.x > width - 20) this.dx *= -1;
  }

  recycle(obstacles) {
    this.x = random(40, width - 40);
    this.y = random(-200, 0);
    this.dx = random([-1, 1]) * 0.9;
    this.type = chooseObstacleType(obstacles);
  }

  checkCollision(cat) {
    const d = dist(cat.x, cat.y, this.x, this.y);

    if (this.type === "rainbow") {
      if (d < this.size / 2 + cat.w / 2) return "rainbow";
    } else {
      if (d < this.size / 2 + cat.w / 2 - 5) return "hit";
    }

    return "none";
  }

  draw() {
    push();
    translate(this.x, this.y);

    if (this.type === "balloon") {
      fill(color(209, 237, 255));
      ellipse(0, 0, this.size + 8, this.size + 10);
      fill("blue");
      triangle(
        -4,
        this.size / 2 - 2,
        4,
        this.size / 2 - 2,
        0,
        this.size / 2 + 6
      );
      stroke(180);
      noFill();
      beginShape();
      for (let t = 0; t < 12; t++)
        vertex(sin(t * 0.5) * 2, this.size / 2 + 6 + t * 3);
      endShape();
      noStroke();
      fill(0);
      ellipse(-5, -3, 3, 3);
      ellipse(5, -3, 3, 3);
      stroke(0);
      noFill();
      arc(0, 3, 8, 5, 0, PI);
      noStroke();
    } else if (this.type === "star") {
      fill("#fff4a3");
      star(0, 0, this.size / 2 - 4, this.size / 2 + 2, 5);
      fill(0);
      ellipse(-5, -3, 3, 3);
      ellipse(5, -3, 3, 3);
      stroke(0);
      noFill();
      arc(0, 3, 8, 5, 0, PI);
      noStroke();
    } else if (this.type === "rainbow") {
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
        arc(0, 0, this.size * 2 + i * 6, this.size + i * 4, PI, TWO_PI);
      }
    }

    pop();
  }
}

function star(x, y, r1, r2, n) {
  beginShape();
  for (let i = 0; i < n * 2; i++) {
    const angle = (PI * i) / n;
    const r = i % 2 === 0 ? r2 : r1;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);
}
export { Obstacle, star };
