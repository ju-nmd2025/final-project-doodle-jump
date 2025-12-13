export default class Effects {
  constructor() {
    this.particles = [];
    this.raindrops = [];
  }

  reset() {
    this.particles.length = 0;
    this.raindrops.length = 0;
  }

  createSparkles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x,
        y,
        vx: random(-2, 2),
        vy: random(-2, -0.5),
        life: 60,
        size: random(3, 6),
        color: color(
          random(200, 255),
          random(150, 255),
          random(200, 255),
        ),
      });
    }
  }

  updateSparkles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life--;

      noStroke();
      fill(
        p.color.levels[0],
        p.color.levels[1],
        p.color.levels[2],
        map(p.life, 0, 60, 0, 255)
      );
      ellipse(p.x, p.y, p.size);

      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  createRaindrops(platform) {
    for (let i = 0; i < 15; i++) {
      this.raindrops.push({
        x: platform.x + random(10, platform.w - 10),
        y: platform.y + 15,
        vy: random(4, 7),
        len: random(8, 14),
      });
    }
  }

  updateRaindrops() {
    for (let i = this.raindrops.length - 1; i >= 0; i--) {
      const d = this.raindrops[i];
      d.y += d.vy;

      stroke(100, 150, 255, 220);
      strokeWeight(2);
      line(d.x, d.y, d.x, d.y + d.len);

      if (d.y > height + 20) this.raindrops.splice(i, 1);
    }
    noStroke();
  }

  applyCameraShift(dy) {
    for (let p of this.particles) p.y += dy;
    for (let d of this.raindrops) d.y += dy;
  }
}
