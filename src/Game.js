import { Rat } from './Rat';
import { Wall } from './Wall';
import { polysIntersect } from './utils';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.#resize();
        window.addEventListener('resize', () => {
            this.#resize();
            this.restart(); // Restart on resize to regenerate maze for new dimensions? Or just scale. Easier to restart.
        });

        this.cellSize = 160;
        this.score = 0;
        this.isRunning = true;
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('game-over');

        document.getElementById('retry-btn').addEventListener('click', () => this.restart());

        this.restart();
    }

    #resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    restart() {
        if (this.reqId) {
            cancelAnimationFrame(this.reqId);
        }

        this.isRunning = true;
        this.victory = false;
        this.particles = [];
        this.scoreElement.innerText = "Escape the Lab!";
        this.gameOverElement.classList.add('hidden');

        // Grid Dimensions (Must be odd for perfect maze with surrounding walls)
        // We'll calculate max odd cols/rows that fit.
        let cols = Math.floor(this.canvas.width / this.cellSize);
        let rows = Math.floor(this.canvas.height / this.cellSize);
        if (cols % 2 === 0) cols--;
        if (rows % 2 === 0) rows--;

        this.cols = cols;
        this.rows = rows;

        this.maze = this.#generateTileMaze(cols, rows);
        this.walls = this.#createWallsFromTileMaze(this.maze);

        // Spawn rat at (1,1) which guaranteed to be path
        this.rat = new Rat(this.cellSize * 1.5, this.cellSize * 1.5);

        // Exit at bottom-right-ish (verify it's a path)
        this.exit = this.#findExit(cols, rows);

        this.#animate();
    }

    #generateTileMaze(cols, rows) {
        // 1 = Wall, 0 = Path
        const grid = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push(1); // Fill with walls
            }
            grid.push(row);
        }

        const startX = 1;
        const startY = 1;
        grid[startY][startX] = 0;

        const stack = [{ x: startX, y: startY }];

        const directions = [
            { dx: 0, dy: -2 }, // Top
            { dx: 2, dy: 0 },  // Right
            { dx: 0, dy: 2 },  // Bottom
            { dx: -2, dy: 0 }  // Left
        ];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];

            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
                    neighbors.push({ x: nx, y: ny, px: current.x + dir.dx / 2, py: current.y + dir.dy / 2 });
                }
            }

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                grid[next.y][next.x] = 0;      // Carve destination
                grid[next.py][next.px] = 0;    // Carve path between
                stack.push({ x: next.x, y: next.y });
            } else {
                stack.pop();
            }
        }
        return grid;
    }

    #createWallsFromTileMaze(grid) {
        const walls = [];
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] === 1) {
                    walls.push(new Wall(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize));
                }
            }
        }
        return walls;
    }

    #findExit(cols, rows) {
        // Search around bottom-right for a 0
        // Try (cols-2, rows-2) first
        let ex = cols - 2;
        let ey = rows - 2;
        while (this.maze[ey][ex] === 1) {
            ex--;
            if (ex < 1) {
                ex = cols - 2;
                ey--;
            }
        }
        return {
            x: ex * this.cellSize + this.cellSize / 2,
            y: ey * this.cellSize + this.cellSize / 2,
            radius: this.cellSize / 3
        };
    }

    #animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Floor
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Exit
        this.ctx.fillStyle = '#00e676';
        this.ctx.beginPath();
        this.ctx.arc(this.exit.x, this.exit.y, this.exit.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(0, 230, 118, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.exit.x, this.exit.y, this.exit.radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        if (!this.victory) {
            // Update Rat with Sliding Collision & Rotation Check
            const oldX = this.rat.x;
            const oldY = this.rat.y;
            const oldAngle = this.rat.angle;

            // Calculate potential new position/rotation
            this.rat.update(this.canvas.width, this.canvas.height);

            const desiredX = this.rat.x;
            const desiredY = this.rat.y;
            const desiredAngle = this.rat.angle;

            // Reset to Old State to apply changes incrementally
            this.rat.x = oldX;
            this.rat.y = oldY;
            this.rat.angle = oldAngle;

            // 1. Try Rotation
            this.rat.angle = desiredAngle;
            if (this.#checkCollision()) {
                this.rat.angle = oldAngle; // Hit wall while turning, deny turn
            }

            // 2. Try X Movement
            this.rat.x = desiredX;
            if (this.#checkCollision()) {
                this.rat.x = oldX; // Hit wall, revert X (Slide)
            }

            // 3. Try Y Movement
            this.rat.y = desiredY;
            if (this.#checkCollision()) {
                this.rat.y = oldY; // Hit wall, revert Y (Slide)
            }
        }

        // Check Win
        const distToExit = Math.hypot(this.rat.x - this.exit.x, this.rat.y - this.exit.y);
        if (distToExit < this.exit.radius + 10 && !this.victory) {
            this.#win();
        }

        // Draw Entities
        for (const wall of this.walls) {
            wall.draw(this.ctx);
        }
        this.rat.draw(this.ctx);

        // Render Fireworks
        this.#updateFireworks();

        this.reqId = requestAnimationFrame(() => this.#animate());
    }

    #checkCollision() {
        const ratPoly = this.rat.getPolygon();
        for (const wall of this.walls) {
            if (polysIntersect(ratPoly, wall.getPolygon())) {
                return true;
            }
        }
        return false;
    }

    #win() {
        this.victory = true;
        this.gameOverElement.querySelector('h2').innerText = "Congratulations!";
        this.gameOverElement.querySelector('button').innerText = "Retry";
        this.gameOverElement.classList.remove('hidden');
    }
    #updateFireworks() {
        // Initialize particles array if needed
        if (!this.particles) this.particles = [];

        // Spawn new fireworks if victory is active
        if (this.victory && Math.random() < 0.1) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                this.particles.push({
                    x: x, y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.0,
                    color: color
                });
            }
        }

        // Update and Draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life -= 0.02;

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        this.ctx.globalAlpha = 1.0;
    }
}
