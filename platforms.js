export default class Platform{
    constructor(x, y, w, moving, dx, breaking){
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

    update(){
      if(this.moving){
        this.x += this.dx;
        if(this.x < 0 || this.x + this.w > width) this.dx *= -1;
      }
    }

    tryLand(cat, prevBottom) {
      if (this.broken) return { landed: false, scored: false, broke: false };

      const catLeft = cat.x - cat.w / 2;
      const catRight = cat.x + cat.w / 2;
      const catBottom = cat.y + cat.h / 2;

      if (
        catLeft < this.x + this.w &&
        catRight > this.x &&
        prevBottom <= this.y &&
        catBottom >= this.y &&
        cat.vy > 0
      ) {
        // bounce
        cat.y = this.y - cat.h / 2;
        cat.vy = -10;

        // scoring (platform remembers if it already scored)
        const scoredNow = !this.scored;
        if (scoredNow) this.scored = true;

        // breaking platform
        const brokeNow = this.breaking;
        if (brokeNow) this.broken = true;

        return { landed: true, scored: scoredNow, broke: brokeNow };
      }

      return { landed: false, scored: false, broke: false };
    }


    recycle(minY) {
    this.x = random(0, width - this.w);

    const gapMin = 80;
    const gapMax = 140;
    this.y = minY - random(gapMin, gapMax);

    this.dx = random([-1, 1]) * random(0.5, 1.2);
    this.moving = random() <0.4;
    this.scored = false;
    this.breaking = random() <0.2;
    this.broken = false;
  }

  draw() {
    if (this.broken) return;

    if (this.breaking){
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
