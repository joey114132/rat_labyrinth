# Project Utilities & Code Explanation

This document explains the file structure and the logic behind the code for the "Lab Rat Escape" game.

## File Structure

### 1. `index.html`
- **Main Entry Point**: This file sets up the game environment.
- **Canvas**: Includes the `<canvas>` element where all graphics are drawn.
- **UI Elements**: Contains the HTML for the title, score, and the "Congratulations" popup.

### 2. `style.css`
- **Styling**: Manages the visual appearance of the game.
- **Themes**: Uses CSS variables for consistent colors (e.g., the "Sterile Lab" theme).
- **Positioning**: Handles the centering of the Game Over popup.

### 3. `main.js`
- **Initialization**: The bridge between HTML and the Game logic. It creates an instance of the `Game` class when the page loads.

---

## Source Code (`src/`)

### 4. `src/Game.js`
- **Game Controller**: This class manages the entire game lifecycle.
- **Key Functions**:
  - `#generateTileMaze()`: Generates a random maze using a recursive algorithm.
  - `#animate()`: The main game loop that runs 60 times a second to update positions and redraw the screen.
  - `#checkCollision()`: Ensures the rat doesn't walk through walls using a "Split-Axis" method (checking X and Y movement separately for smooth sliding).
  - `#updateFireworks()`: Creates the celebratory particle effect upon winning.

### 5. `src/Rat.js`
- **Player Character**: Defines how the rat moves and looks.
- **Physics**:
  - Uses `acceleration` and `friction` to create a realistic driving feel.
  - `turnSpeed` determines how fast the rat rotates.
- **Controls**: Listens for Arrow Keys to trigger movement.

### 6. `src/Wall.js`
- **Obstacles**: Represents the walls of the maze.
- **Collision**: Provides the boundary data used by `Game.js` to detect hits.

### 7. `src/utils.js`
- **Mathematics**: Contains helper functions like `polysIntersect` which performs the geometry calculations needed to check if the rotating rat rectangle overlaps with any wall rectangles.
