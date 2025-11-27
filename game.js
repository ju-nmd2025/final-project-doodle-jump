function setup(){
     createCanvas(300,450);
     background("lavender");

}

function draw(){
    push();
    strokeWeight(2);
    stroke("orange");
    fill("yellow");
    circle(250, 415, 25);
    pop();
    push();
    fill("pink");
    strokeWeight(3);
    stroke("magenta");
    rect(100, 100, 80, 20);
    rect(200, 200, 80, 20);
    rect(150, 30, 80, 20);
    rect(50, 400, 80, 20);
    rect(100, 250, 80, 20);
    rect(0, 350, 80, 20);
    pop();
    push();
    strokeWeight(20);
    stroke("green");
    line(300, 440, 0, 440);
    pop();
}


