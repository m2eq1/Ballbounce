let counter = 0;
const counterDisplay = document.getElementById("counter");
const buttonPlus = document.querySelector(".theButton button");

const balls = [];

const gravity = 0.5;
const ballSize = 20;
const gap = 4;       // space between balls when stacked
const damping = 0.8; // collision damping
const friction = 0.98; // floor friction slowing horizontal movement

buttonPlus.addEventListener("click", () => {
  counter++;
  counterDisplay.textContent = counter;
  createBall();
});

function createBall() {
  const ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.width = ballSize + "px";
  ball.style.height = ballSize + "px";
  ball.style.position = "fixed";
  ball.style.pointerEvents = "none";

  const x = Math.random() * (window.innerWidth - ballSize);
  const y = 0;

  ball.style.left = x + "px";
  ball.style.top = y + "px";

  document.body.appendChild(ball);

  balls.push({
    el: ball,
    x: x,
    y: y,
    vx: 0,
    vy: 0,
  });
}

function rectCircleCollision(rect, ball) {
  // Find closest point on rect to ball center
  const closestX = Math.max(rect.left, Math.min(ball.x + ballSize / 2, rect.right));
  const closestY = Math.max(rect.top, Math.min(ball.y + ballSize / 2, rect.bottom));

  // Calculate distance between ball center and closest point
  const dx = (ball.x + ballSize / 2) - closestX;
  const dy = (ball.y + ballSize / 2) - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ballSize / 2) {
    // Collision detected!

    // Normal vector from closest point to ball center
    const nx = dx / distance || 0;
    const ny = dy / distance || 0;

    // Penetration depth
    const penetration = (ballSize / 2) - distance;

    // Push ball out of rect by penetration depth along normal
    ball.x += nx * penetration;
    ball.y += ny * penetration;

    // Reflect velocity on collision normal with damping
    const vDotN = ball.vx * nx + ball.vy * ny;
    if (vDotN < 0) {
      ball.vx -= (1 + damping) * vDotN * nx;
      ball.vy -= (1 + damping) * vDotN * ny;
    }

    return true;
  }
  return false;
}

function animate() {
  const bottomLimit = window.innerHeight - ballSize;

  // Get bounding rects for static objects
  const buttonRect = buttonPlus.getBoundingClientRect();
  const counterRect = counterDisplay.getBoundingClientRect();

  balls.forEach(ball => {
    // gravity
    ball.vy += gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // keep inside horizontal bounds
    if (ball.x < 0) {
      ball.x = 0;
      ball.vx = -ball.vx * damping;
    }
    if (ball.x > window.innerWidth - ballSize) {
      ball.x = window.innerWidth - ballSize;
      ball.vx = -ball.vx * damping;
    }

    // floor collision and friction
    if (ball.y > bottomLimit) {
      ball.y = bottomLimit;
      if (ball.vy > 0) ball.vy = 0;
      ball.vx *= friction;
      if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
    }

    // Collision with button and counter display
    rectCircleCollision(buttonRect, ball);
    rectCircleCollision(counterRect, ball);
  });

  // collision & gap handling between balls
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i];
      const b2 = balls[j];

      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = ballSize + gap;

      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // push balls apart with gap
        const pushX = nx * overlap / 2;
        const pushY = ny * overlap / 2;

        b1.x -= pushX;
        b1.y -= pushY;
        b2.x += pushX;
        b2.y += pushY;

        // collision impulse
        const vxDiff = b2.vx - b1.vx;
        const vyDiff = b2.vy - b1.vy;
        const dotProduct = vxDiff * nx + vyDiff * ny;

        if (dotProduct < 0) {
          const impulse = dotProduct * damping;
          b1.vx += nx * impulse;
          b1.vy += ny * impulse;
          b2.vx -= nx * impulse;
          b2.vy -= ny * impulse;
        }
      }
    }
  }

  // update DOM positions
  balls.forEach(ball => {
    ball.el.style.left = ball.x + "px";
    ball.el.style.top = ball.y + "px";
  });

  requestAnimationFrame(animate);
}

animate();
