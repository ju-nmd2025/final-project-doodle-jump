export default class Cat {
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
    this.x = constrain(this.x, this.w / 2, width - this.w / 2);
  }

  draw() {
    this.drawCuteCat(this.x, this.y);
  }

  // Purple cat
  drawCuteCat(x, y) {
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
}
