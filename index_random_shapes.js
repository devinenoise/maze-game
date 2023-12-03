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

const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint } =
  Matter;

const engine = Engine.create();
const { world } = engine;

const width = 800;
const height = 600;

const render = Render.create({
  element: document.body,
  engine,
  options: {
    width,
    height,
    wireframes: false
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Mouse control enabled
World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
  })
);

// Walls
const walls = [
  // top
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  // bottom
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  // left
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  // right
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];
World.add(world, walls);

// Random Shapes
for (let i = 0; i < 50; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
    );
  } else {
    World.add(
      world,
      Bodies.circle(Math.random() * width, Math.random() * height, 35)
    );
  }
}
