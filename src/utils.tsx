const maxSpeed = 15;

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function setupCanvas(canvas: HTMLCanvasElement, dpr: number) {
  if (!canvas) return;

  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  return { canvas, ctx, rect };
}

export function fragmentText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  var words = text.split(" "),
    lines = [],
    line = "";
  if (ctx.measureText(text).width < maxWidth) {
    return [text];
  }
  while (words.length > 0) {
    var split = false;
    while (ctx.measureText(words[0]).width >= maxWidth) {
      var tmp = words[0];
      words[0] = tmp.slice(0, -1);
      if (!split) {
        split = true;
        words.splice(1, 0, tmp.slice(-1));
      } else {
        words[1] = tmp.slice(-1) + words[1];
      }
    }
    if (ctx.measureText(line + words[0]).width < maxWidth) {
      line += words.shift() + " ";
    } else {
      lines.push(line);
      line = "";
    }
    if (words.length === 0) {
      lines.push(line);
    }
  }
  return lines;
}

/** Describes object (circle) drawn on canvas and its attributes. */
export class Shape {
  ctx;
  x: number;
  y: number;
  r: number;
  ax: number;
  ay: number;
  m: number;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
  t: string;
  circle: Path2D;
  fillStyle: string;
  fillBorderStyle: string;
  isActive: boolean;
  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    ax: number,
    ay: number,
    m: number,
    title: string,
    vx: number = 0,
    vy: number = 0
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.r = radius;
    this.ax = ax;
    this.ay = ay;
    this.m = m;
    this.vx = vx;
    this.vy = vy;
    this.fx = 0;
    this.fy = 0;
    this.t = title;
    this.circle = new Path2D();
    this.fillStyle = "#373A36";
    this.fillBorderStyle = "#fff";
    this.isActive = false;
  }

  move(dt: number) {
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    if (this.vx > maxSpeed) {
      this.vx = maxSpeed;
    }
    if (this.vx < -maxSpeed) {
      this.vx = -maxSpeed;
    }
    if (this.vy > maxSpeed) {
      this.vy = maxSpeed;
    }
    if (this.vy < -maxSpeed) {
      this.vy = -maxSpeed;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw() {
    //draw a circle
    this.circle = new Path2D();
    this.ctx.fillStyle = this.fillStyle;
    this.circle.arc(this.x, this.y, this.r - 8, 0, Math.PI * 2);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.fillBorderStyle;
    this.ctx.stroke(this.circle);
    this.ctx.fill(this.circle);

    this.ctx.fillStyle = "#fff";
    this.ctx.font = `100 ${this.r / 5}px Helvetica`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    for (const [i, fragment] of fragmentText(
      this.ctx,
      this.t,
      this.r * 2 - 8
    ).entries()) {
      this.ctx.fillText(fragment, this.x, this.y + i * 20);
    }
  }

  setHover(isHover = true) {
    if (this.isActive) return;
    if (isHover) {
      this.fillStyle = "#FF7043";
      this.fillBorderStyle = "#FF7043";
    } else {
      this.fillStyle = "#373A36";
      this.fillBorderStyle = "#fff";
    }
  }

  setActive() {
    if (this.isActive) {
      this.fillStyle = "#373A36";
      this.fillBorderStyle = "#fff";
      this.r = 50;
    } else {
      this.fillStyle = "#FF7043";
      this.fillBorderStyle = "#FF7043";
      this.r = 60;
    }
    this.isActive = !this.isActive;
  }

  resolveEdgeCollision(canvasWidth: number, canvasHeight: number) {
    // Detect collision with right wall.
    if (this.x + this.r > canvasWidth) {
      // Need to know how much we overshot the canvas width so we know how far to 'bounce'.
      this.x = canvasWidth - this.r;
      this.vx = -this.vx;
      this.ax = -this.ax;
    }

    // Detect collision with bottom wall.
    else if (this.y + this.r > canvasHeight) {
      // this.y = c.height - this.r;
      this.y = canvasHeight + 30 - this.r;
      this.vy = -this.vy;
      this.ay = -this.ay;
    }

    // Detect collision with left wall.
    else if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx = -this.vx;
      this.ax = -this.ax;
    }
    // Detect collision with top wall.
    else if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy = -this.vy;
      this.ay = -this.ay;
    }
  }
}

/** Object describing collision between 2 objects */
export class Collision {
  o1: Shape;
  o2: Shape;
  dx: number;
  dy: number;
  d: number;
  constructor(o1: Shape, o2: Shape, dx: number, dy: number, d: number) {
    this.o1 = o1;
    this.o2 = o2;
    this.dx = dx;
    this.dy = dy;
    this.d = d;
  }
}

export function checkCollision(o1: Shape, o2: Shape) {
  let dx = o2.x - o1.x;
  let dy = o2.y - o1.y;
  let d = Math.sqrt(dx ** 2 + dy ** 2);
  if (d < o1.r + o2.r) {
    return {
      collisionInfo: new Collision(o1, o2, dx, dy, d),
      collided: true
    };
  }
  return {
    collisionInfo: null,
    collided: false
  };
}

export function moveWithGravity(dt: number, o: Shape[]) {
  // "o" refers to Array of objects we are moving
  for (let o1 of o) {
    // Zero-out accumulator of forces for each object
    o1.fx = 0;
    o1.fy = 0;
  }
  for (let [i, o1] of o.entries()) {
    // For each pair of objects...
    for (let [j, o2] of o.entries()) {
      if (i < j) {
        // To not do same pair twice
        let dx = o2.x - o1.x; // Compute distance between centers of objects
        let dy = o2.y - o1.y;
        let r = Math.sqrt(dx ** 2 + dy ** 2);
        if (r < 1) {
          // To avoid division by 0
          r = 1;
        }
        let f = (100 * o1.m * o2.m) / r ** 2; // Compute force for this pair
        let fx = (f * dx) / r; // Break it down
        let fy = (f * dy) / r;
        o1.fx += fx; // Accumulate for first object
        o1.fy += fy;
        o2.fx -= fx; // And for second object in opposite direction
        o2.fy -= fy;
      }
    }
  }
  for (let o1 of o) {
    // for each object update...
    let ax = o1.fx / o1.m; // ...acceleration
    let ay = o1.fy / o1.m;

    o1.vx += ax * dt; // ...speed
    o1.vy += ay * dt;

    o1.x += o1.vx * dt; // ...position
    o1.y += o1.vy * dt;
  }
}

/** Resolves collision by bouncing objects. */
export function resolveCollisionWithBounce(info: Collision) {
  let nx = info.dx / info.d;
  let ny = info.dy / info.d;
  let s = info.o1.r + info.o2.r - info.d;
  info.o1.x -= (nx * s) / 2;
  info.o1.y -= (ny * s) / 2;
  info.o2.x += (nx * s) / 2;
  info.o2.y += (ny * s) / 2;

  // Magic...
  let k =
    (-2 * ((info.o2.vx - info.o1.vx) * nx + (info.o2.vy - info.o1.vy) * ny)) /
    (1 / info.o1.m + 1 / info.o2.m);
  info.o1.vx -= (k * nx) / info.o1.m; // Same as before, just added "k" and switched to "m" instead of "s/2"
  info.o1.vy -= (k * ny) / info.o1.m;
  info.o2.vx += (k * nx) / info.o2.m;
  info.o2.vy += (k * ny) / info.o2.m;
}

// function createShape(event: MouseEvent, radius = 40, mass = 100) {
//   let x = event.pageX - canvas.offsetLeft;
//   let y = event.pageY - canvas.offsetTop;

//   itemsRef.current.push(
//     new Shape(
//       ctx,
//       x,
//       y,
//       radius,
//       getRandomInt(-1, 1),
//       getRandomInt(-1, 1),
//       mass,
//       "new Shape"
//     )
//   );
// }
