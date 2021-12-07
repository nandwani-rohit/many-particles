//radius of the circular table = R
let R, N, pellets = [], epsilon, v_default, r_default, c_default, origin_x, origin_y, started, paused, onceCreated, marked, start_button, pause_button, end_button, r_percent, r_input, N_input, mark_input, display_p, display_v, canva, display_precision;

function setup() 
{
  canva = createCanvas(windowWidth, windowHeight);
  canva.style('display', 'block');
  epsilon = 1;
  display_precision = 3;

  // Assuming horizontal mode for "now"
  R = min(width * 30/100, height * 50/100) * 95/100;
  origin_x = width * 30/100;
  origin_y = height * 50/100;

  createStuff();

  if (!(isNaN(int(N_input.value())) || int(N_input.value()) <= 0))
  {
    N = int(N_input.value());
  }

  if (!(isNaN(float(r_input.value())) || float(r_input.value()) < 0.1))
  {
    r_default = 10 * r_input.value() * R / 288;
  }

  if (!(isNaN(float(v_input.value())) || float(v_input.value()) <= 0))
  {
    v_default = 5 * v_input.value() * R / 288;
  }

  pellets = [];
  c_default = color(130);

  translate(origin_x, origin_y);

  scale(1, -1);

  for (let i = 0; i < N; ++i) 
  {
    pellets[i] = Pellet.default();
  }

  if (!(isNaN(int(mark_input.value())) || int(mark_input.value()) < 1 || int(mark_input.value()) > N))
  {
    marked = int(mark_input.value()) - 1;
  }

  pellets[marked].mark();

  background(50);

  started = false;
  paused = false;
}

function createStuff()
{

  if (onceCreated == undefined)
  {

    start_button = select('#startbutton');
    start_button.mousePressed(start);

    pause_button = select('#pausebutton');
    pause_button.mousePressed(pause);

    end_button = select('#endbutton');
    end_button.mousePressed(end);

    N_input = select('#Ninput');
    mark_input = select('#minput');
    r_input = select('#rinput');
    v_input = select('#vinput');
    r_percent = select('#rinputsub');
    display_p = select('#pdisplay');
    display_v = select('#vdisplay');

    onceCreated = true;
    N = 50;
    marked = 0;
    r_default = 10 * R / 288;
    v_default = 5 * R / 288;
  }
}

function start()
{
  if (started == false)
  {
    setup();
    started = true;
  }
}


function pause()
{
  if (paused == false && started == true)
  {
    paused = true;
  }
  else if (paused == true)
  {
    paused = false;
  }
}

function end()
{
  if (started == true || paused == true)
  {
    loop();
    setup();
  }
}


function windowResized() 
{
  resizeCanvas(windowWidth, windowHeight);
}

function draw() 
{
  background(50);

  if (!isNaN(float(r_input.value())))
  {
    r_percent.html("(r = " + nfc(100*abs(r_input.value())/28.8,2) + " % of R)");
  }

  display_p.html("position = &nbsp; ( " + nfc(pellets[marked].position.x/R,display_precision) + "R,&nbsp;&nbsp;" + nfc(pellets[marked].position.y/R,display_precision) + "R )");
  display_v.html("velocity = &nbsp; ( " + nfc(pellets[marked].velocity.x/v_default,display_precision) + "u,&nbsp;&nbsp;" + nfc(pellets[marked].velocity.y/v_default,display_precision) + "u )");  

  translate(origin_x, origin_y);
  scale(1, -1);

  stroke(0);
  fill(255);
  ellipseMode(RADIUS);
  ellipse(0, 0, R);

  if (!(isNaN(int(mark_input.value())) || int(mark_input.value()) < 1 || int(mark_input.value()) > N))
  {
    pellets[marked].unmark();
    marked = int(mark_input.value()) - 1;
    pellets[marked].mark();
  }


  for (let i = 0; i < N; ++i) 
  {
    pellets[i].drawPellet();

    if (started == true)
    {
      for (let j = i + 1; j < N; ++j) 
      {
        pellets[i].checkCollision(pellets[j]);
      }

      if (paused == false)
      {
        pellets[i].update();
      }
    }
  }

  displayArrow(pellets[marked],'position');
  displayArrow(pellets[marked], 'velocity');
}

function displayArrow(pellet, vectorType)
{
  if (vectorType == 'position')
  {
    stroke('#0293b8');
    fill('#0293b8');
    let s1 = pellet.position.copy();
    let l = pellet.position.mag();
    let s3 = s1.copy();
    s3.setMag(l - pellet.r);
    s1.setMag(l - pellet.r -.04*R);
    let s2 = s1.copy();
    
    let n = createVector(- s3.y, s3.x);
    n.setMag(.03*R);
    s1.sub(n);
    s2.add(n);
    triangle(s1.x, s1.y, s2.x, s2.y, s3.x, s3.y);
    line(0, 0, s3.x, s3.y);

  }
  else if (vectorType == 'velocity')
  {
    stroke('#07a629');
    fill('#07a629');    
    let s1, s2, s3, l, n;
    s1 = pellet.velocity.copy();
    s1.setMag(pellet.r);
    push();
    translate(pellet.position.x + s1.x, pellet.position.y + s1.y);

    l = 50 * pellet.velocity.mag() / v_default;
    s1.setMag(l);
    s2 = pellet.velocity.copy();
    s2.setMag(l - 0.03*R);
    s3 = s2.copy();
    
    n = createVector(- s1.y, s1.x);
    n.setMag(0.02 * R);
    s2.sub(n);
    s3.add(n);
    triangle(s1.x, s1.y, s2.x, s2.y, s3.x, s3.y);
    line(0, 0, s1.x, s1.y);

    pop();
  }

}

class Pellet 
{
  // position = (x,y)
  // velocity = (v_x,v_y)
  // radius = r
  // color = c

  //Constructor Method
  constructor(position, velocity, radius, c) 
  {
    this.c = c;
    this.r = radius;
    this.position = position;
    this.velocity = velocity;
  }

  // constructor with no arguments......
  // position = random on x-axis
  // velocity = random using v_default
  // radius = r_default
  // color = c_default
  static default() 
  {
    let position = createVector(random(-R + 3 * r_default, R - 3 * r_default), 0);
    let velocity = createVector(random(-v_default, v_default), random(-v_default, v_default));
    return new Pellet(position, velocity, r_default, c_default);
  }

  // pass just the position arguments
  static withPosition(position_x, position_y) 
  {
    let position = createVector(position_x, position_y);
    let velocity = createVector(random(-v_default, v_default), random(-v_default, v_default));
    return new Pellet(position, velocity, r_default, c_default);
  }


  drawPellet() 
  {
    noStroke();
    fill(this.c);
    ellipseMode(RADIUS);
    if (!this.amIMarked || this.amIMarked)
    {
      ellipse(this.position.x, this.position.y, this.r);
    }
  }

  update() 
  {
    this.position.add(this.velocity);

    if (this.position.mag() >= R - this.r) 
    {
      // normal n = position/|position| 
      // change = 2(v.n) n
      let change = this.position.copy();
      change.mult(2 * this.velocity.dot(this.position) / this.position.magSq());

      // v = u - change
      this.velocity.sub(change);

      this.position.setMag(R - this.r - epsilon);
    }
  }

  // checks if this pellet is colliding with the other pellet
  checkCollision(other)
  {
    if (p5.Vector.dist(this.position, other.position) <= (this.r + other.r)) 
    {
      // collision alert!

      // n = (r2 - r1)
      let normal = other.position.copy();
      normal.sub(this.position);

      // relative velocity of other pellet w.r.t this pellet
      // ------         v21 = v2 - v1      ------------      
      let relativeVelocity = other.velocity.copy();
      relativeVelocity.sub(this.velocity);

      // change = (v21.n)/|n|^2 n
      let change = normal.copy();
      change.mult(relativeVelocity.dot(normal) / normal.magSq());

      // v1 = v1 + change
      this.velocity.add(change);

      // v2 = v2 - change
      other.velocity.sub(change);

      // change = n/|n| (R1+R2-n+epsilon)/2 
      change = normal.copy();
      change.setMag((this.r + other.r - normal.mag() + epsilon) / 2);

      // r1 = r1 - change
      this.position.sub(change);

      // r2 = r2 + change
      other.position.add(change);
    }
  }

  mark() 
  {
    this.c = color('#FF0000');
    this.amIMarked = true;
  }

  unmark()
  {
    this.c = c_default;
    this.amIMarked = false;
  }

}
