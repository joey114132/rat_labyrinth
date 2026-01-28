# Lab Rat Escape - Project Documentation

This game is a web-based maze escape simulation where you control a rat to find the exit. It is built using **Vite** and **Vanilla JavaScript**.

## Project Structure & File Guide

### 1. [index.html](./index.html)
**Purpose**: The main entry point of the web page.
- **Canvas**: Contains the `<canvas id="gameCanvas">` element where the game is rendered.
- **UI Overlay**:
  - `#ui-layer`: Displays the title and instructions.
  - `#game-over`: The "Congratulations" popup with the "Retry" button. It is placed outside the UI layer to ensure proper centering.

### 2. [style.css](./style.css)
**Purpose**: Handles global styling and themes.
- Defines the "Sterile Lab" aesthetic using CSS variables.
- Centers the `#game-over` popup using absolute positioning and transforms.
- styles the "Retry" button with hover effects.

### 3. [main.js](./main.js)
**Purpose**: The JavaScript entry point.
- Imports the `Game` class.
- Initializes the game instance on the `#gameCanvas`.

---

## Source Code (`src/`)

### 4. [src/Game.js](./src/Game.js)
**Purpose**: The main game controller.
- **Maze Generation**: Uses a **Recursive Backtracker** algorithm in `#generateTileMaze` to create a new random maze layout every time.
- **Game Loop**: The `#animate` method runs continuously to update physics and redraw the screen.
- **Collision Logic**: Implements "Split-Axis" collision checks. It moves the rat along X, checks collision (and stops if hit), then moves along Y. This prevents sticking and allows sliding along walls.
- **Fireworks**: The `#updateFireworks` method renders a particle celebration effect when the user wins.

### 5. [src/Rat.js](./src/Rat.js)
**Purpose**: The player character logic.
- **Physics**: Implements acceleration, friction, and velocity.
  - **`update()`**: Calculates the new position based on speed and angle.
  - **`#move()`**: Handles Arrow Key inputs. Up/Down changes speed (acceleration), Left/Right changes angle (rotation).
- **Rendering**: Draws the rat using HTML5 Canvas paths (brown body, pink tail, ears).

### 6. [src/Wall.js](./src/Wall.js)
**Purpose**: Represents individual wall blocks.
- **Visuals**: simple dark rectangles that form the maze structure.
- **Collision**: Provides `getPolygon()` to help detect intersections with the rat.

### 7. [src/utils.js](./src/utils.js)
**Purpose**: Math helper functions.
- **`polysIntersect(poly1, poly2)`**: The core function for collision detection. It checks if any edge of the rat's shape overlaps with any edge of a wall.

## Deployment
This project is configured for **Netlify**.
- `netlify.toml`: Tells Netlify to build using `npm run build` and publish the `dist` folder.
