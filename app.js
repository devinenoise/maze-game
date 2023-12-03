/* Big Challenges / Solutions

Matter JS docs -- brm.io/matter-js

1. How do we generate the maze?
  a. Algorithms generate the maze.  Learn about tree data structure and recursion to implement a simple Algorithm.

2. How are we going to going to draw it on the screen?
  a. Use Matter JS to draw the maze on a canvas element

3. How do we make the keyboard keys control the ball?
  a. Matter JS has the ability to map key presses

4. How do we detect the ball touching the green square?
  a. Matter JS has the ability to detect collisions between different shapes and report them as events.

*/

/* Building a Maze

1.  Create a grid of cells
2.  Pick a random starting cell
3.  For that cell build a randomly ordered list of neighbors
4.  If a neighbor has visited before, remove it from the list
5.  For each remaining neighbor, 'move' to it and remove the wall between those two cells
6.  Repeat for this new neighbor

*/

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;

// maze size
// let cellsHorizontal = 6;
// let cellsVertical = 4;
const width = window.innerWidth;
const height = window.innerHeight * 0.9;
const borderWidth = 1;

// cell size
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const wallWidth = 2;

// ball properties
const ballVelocity = 3.5;

const render = Render.create({
  element: document.querySelector('.app'),
  engine,
  options: {
    width,
    height,
    wireframes: false
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Canvas Border
const border = [
  // https://brm.io/matter-js/docs/classes/Bodies.html#method_rectangle
  // x, y, width, height, options
  // top
  Bodies.rectangle(width / 2, 0, width, borderWidth, {
    isStatic: true,
    label: 'border'
  }),
  // bottom
  Bodies.rectangle(width / 2, height, width, borderWidth, {
    isStatic: true,
    label: 'border'
  }),
  // left
  Bodies.rectangle(0, height / 2, borderWidth, height, {
    isStatic: true,
    label: 'border'
  }),
  // right
  Bodies.rectangle(width, height / 2, borderWidth, height, {
    isStatic: true,
    label: 'border'
  })
];
World.add(world, border);

// Maze generation

const shuffle = arr => {
  // Initializing a counter to the length of the array
  let counter = arr.length;
  // Loop until the counter becomes 0
  while (counter > 0) {
    // Generating a random index within the range of the counter
    const index = Math.floor(Math.random() * counter);
    // Decreasing the counter by 1
    counter--;
    // Swapping elements between the current counter position and the randomly chosen index
    const temp = arr[counter]; // Storing the element at the current counter position in a temporary variable
    arr[counter] = arr[index]; // Assigning the element at the randomly chosen index to the current counter position
    arr[index] = temp; // Assigning the element from the temporary variable to the randomly chosen index
  }
  return arr;
};

const grid = Array(cellsVertical)
  // init the array
  .fill(null)
  // map gives a diff array in memory
  .map(() => Array(cellsHorizontal).fill(false));

// init vertical walls
const verticals = Array(cellsVertical)
  .fill(null)
  // 2 columns
  .map(() => Array(cellsHorizontal - 1).fill(false));

// init horizontal walls
const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

// randomize the [row][column] pick
const startingRow = Math.floor(Math.random() * cellsVertical);
const startingColumn = Math.floor(Math.random() * cellsHorizontal);

// algorithm
const mazePath = (row, column) => {
  // if I have visited the cell at [row, column], then return
  if (grid[row][column]) return;
  // Mark this cell as being visited
  grid[row][column] = true;
  // Assemble randomly-ordered list of neighbors with directions
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);
  // For each neighbor....
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    // See if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    // If we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    // Remove a wall from either horizontals[] or verticals[]
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    mazePath(nextRow, nextColumn);
  }
  // Visit that next cell (recursion)
};

mazePath(startingRow, startingColumn);

// 2d array
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    // x, y, width, height, options
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      wallWidth,
      { isStatic: true, label: 'wall', render: { fillStyle: 'purple' } }
    );
    World.add(world, wall);
  });
});
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    // x, y, width, height, options
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      wallWidth,
      unitLengthY,
      { isStatic: true, label: 'wall', render: { fillStyle: 'purple' } }
    );
    World.add(world, wall);
  });
});

// Goal
const goal = Bodies.rectangle(
  // x, y, width, height, options
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.5,
  unitLengthY * 0.5,
  { isStatic: true, label: 'goal', render: { fillStyle: 'green' } }
);
World.add(world, goal);

// Control Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
  render: { fillStyle: 'blue' }
});
World.add(world, ball);
document.addEventListener('keyup', event => {
  const { x, y } = ball.velocity;
  if (event.code === 'KeyW') {
    // up
    Body.setVelocity(ball, { x, y: y - ballVelocity });
  }
  if (event.code === 'KeyD') {
    // right
    Body.setVelocity(ball, { x: x + ballVelocity, y });
  }
  if (event.code === 'KeyS') {
    // down
    Body.setVelocity(ball, { x, y: y + ballVelocity });
  }
  if (event.code === 'KeyA') {
    // left
    Body.setVelocity(ball, { x: x - ballVelocity, y });
  }
});

// Function to handle touch events
function handleTouchStart(event) {
  const touch = event.touches[0]; // Consider the first touch in a multi-touch scenario
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  const touch = event.touches[0]; // Consider the first touch in a multi-touch scenario
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      // Right
      Body.setVelocity(ball, { x: ballVelocity, y: 0 });
    } else {
      // Left
      Body.setVelocity(ball, { x: -ballVelocity, y: 0 });
    }
  } else {
    if (deltaY > 0) {
      // Down
      Body.setVelocity(ball, { x: 0, y: ballVelocity });
    } else {
      // Up
      Body.setVelocity(ball, { x: 0, y: -ballVelocity });
    }
  }
}

function handleTouchEnd() {
  // Clear velocity when touch ends, if needed
  Body.setVelocity(ball, { x: 0, y: 0 });
}

// Add touch event listeners
let touchStartX, touchStartY;
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);

// Win Condition
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(collision => {
    const labels = ['ball', 'goal'];

    // console.log(collision.bodyA.label)
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      timerStop();
      increaseCells();
      winningMessage();

      world.gravity.y = 1;
      Body.setStatic(ball, true);
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
