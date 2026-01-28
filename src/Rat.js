export class Rat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 50;
    this.speed = 0;
    this.angle = 0;
    // Slower speed for precise maze navigation
    this.maxSpeed = 2;
    this.friction = 0.05;
    this.acceleration = 0.1;
    this.turnSpeed = 0.06;

    this.controls = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    };

    this.#addListeners();
  }

  #addListeners() {
    document.onkeydown = (event) => {
      if (this.controls[event.key] !== undefined) {
        this.controls[event.key] = true;
      }
    };
    document.onkeyup = (event) => {
      if (this.controls[event.key] !== undefined) {
        this.controls[event.key] = false;
      }
    };
  }

  update(gameWidth, gameHeight) {
    this.#move();
    this.#checkBounds(gameWidth, gameHeight);
  }

  #move() {
    if (this.controls.ArrowUp) {
      this.speed += this.acceleration;
    }
    if (this.controls.ArrowDown) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }

    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    // Allow turning in place
    const flip = this.speed < 0 ? -1 : 1;
    if (this.controls.ArrowLeft) {
      this.angle += this.turnSpeed * flip;
    }
    if (this.controls.ArrowRight) {
      this.angle -= this.turnSpeed * flip;
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  #checkBounds(gameWidth, gameHeight) {
    // Clamp within world
    if (this.x < 0) this.x = gameWidth;
    if (this.x > gameWidth) this.x = 0;
    if (this.y < 0) this.y = gameHeight;
    if (this.y > gameHeight) this.y = 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);

    // Rat Body
    ctx.fillStyle = '#8B4513'; // SaddleBrown
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(-8, -8, 6, 0, Math.PI * 2);
    ctx.arc(8, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#FFC0CB';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(5, 25, 0, 35);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-4, -5, 2, 0, Math.PI * 2);
    ctx.arc(4, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    });
    return points;
  }
}
