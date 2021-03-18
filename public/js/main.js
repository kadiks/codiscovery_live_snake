const WIDTH = 400;
const HEIGHT = 300;
const BLOCK_SIZE = 10;

let snake = null;
let snakes = [];
let foods = [];

class Snake {
  constructor({ id, x = 0, y = 0, dirX = 1, dirY = 0, color = "yellow" } = {}) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.color = color;

    this.speed = BLOCK_SIZE;
    this.length = 2;
    this.tail = [];
  }

  dir(dir) {
    switch (dir) {
      case "up":
        if (this.dirY === 1) {
          return;
        }
        this.dirX = 0;
        this.dirY = -1;
        break;
      case "right":
        if (this.dirX === -1) {
          return;
        }
        this.dirX = 1;
        this.dirY = 0;
        break;
      case "down":
        if (this.dirY === -1) {
          return;
        }
        this.dirX = 0;
        this.dirY = 1;
        break;
      case "left":
        if (this.dirX === 1) {
          return;
        }
        this.dirX = -1;
        this.dirY = 0;
        break;
    }

    socket.emit("c-snake-update", this.getInfo());
  }

  draw() {
    this.fillColor();
    rect(this.x, this.y, BLOCK_SIZE, BLOCK_SIZE);
    this.tail.forEach(({ x, y }) => {
      rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    });
  }

  fillColor() {
    const colorMap = {
      yellow: [255, 177, 30],
      blue: [57, 177, 198],
      orange: [209, 98, 0],
      darkblue: [39, 121, 134],
      lightblue: [240, 249, 238],
    };

    const colors = colorMap[this.color] || "darkblue";

    fill(colors[0], colors[1], colors[2]);
  }

  getInfo() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      dirX: this.dirX,
      dirY: this.dirY,
      length: this.length,
    };
  }

  move() {
    if (this.tail.length === this.length) {
      this.tail.shift();
    }

    if (this.tail.length < this.length) {
      this.tail.push({
        x: this.x,
        y: this.y,
      });
    }

    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;

    this.tail.forEach(({ x, y }) => {
      if (this.x === x && this.y === y) {
        this.reset();
      }
    });

    if (this.x >= WIDTH) {
      this.x = 0;
    }
    if (this.x < 0) {
      this.x = WIDTH;
    }
    if (this.y >= HEIGHT) {
      this.y = 0;
    }
    if (this.y < 0) {
      this.y = HEIGHT;
    }
  }

  reset() {
    this.tail.splice(0, this.tail.length - 2);
    this.length = 2;
  }
}

class Food {
  constructor({ x = 0, y = 0 } = {}) {
    this.x = x;
    this.y = y;
  }

  draw() {
    fill(255, 0, 0);
    rect(this.x + 1, this.y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
  }
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(5);

  // foods.push(
  //   new Food({
  //     x: parseInt(random(0, WIDTH) / BLOCK_SIZE) * BLOCK_SIZE,
  //     y: parseInt(random(0, HEIGHT) / BLOCK_SIZE) * BLOCK_SIZE,
  //   })
  // );

  // random() => 155.1234
  // 155.1234 / BLOCK_SIZE = 10 => 15.51234
  // 15.51234 => 15
  // 15 * BLOCK_SIZE = 10 => 150
}

function draw() {
  background(0);

  if (snake === null) {
    return;
  }

  snake.draw();
  snake.move();

  for (let sIndex = snakes.length - 1; sIndex >= 0; sIndex--) {
    snakes[sIndex].draw();
    snakes[sIndex].move();
  }

  for (let fIndex = foods.length - 1; fIndex >= 0; fIndex--) {
    foods[fIndex].draw();
    if (
      collideRectRect(
        snake.x,
        snake.y,
        BLOCK_SIZE,
        BLOCK_SIZE,
        foods[fIndex].x + 1,
        foods[fIndex].y + 1,
        BLOCK_SIZE - 2,
        BLOCK_SIZE - 2
      )
    ) {
      // foods.push(
      //   new Food({
      //     x: parseInt(random(0, WIDTH) / BLOCK_SIZE) * BLOCK_SIZE,
      //     y: parseInt(random(0, HEIGHT) / BLOCK_SIZE) * BLOCK_SIZE,
      //   })
      // );
      socket.emit("c-food-eaten", {
        x: foods[fIndex].x,
        y: foods[fIndex].y,
      });

      foods.splice(fIndex, 1);
      snake.length++;
      socket.emit("c-snake-update", snake.getInfo());
    }
  }
}

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      snake.dir("up");
      break;
    case RIGHT_ARROW:
      snake.dir("right");
      break;
    case DOWN_ARROW:
      snake.dir("down");
      break;
    case LEFT_ARROW:
      snake.dir("left");
      break;
  }
}

const socket = io();

const onSocketConnect = () => {
  setTimeout(() => {
    const randDir = Math.random() < 0.5 ? 1 : 0;

    snake = new Snake({
      id: socket.id,
      x: parseInt(random(0, WIDTH) / BLOCK_SIZE) * BLOCK_SIZE,
      y: parseInt(random(0, HEIGHT) / BLOCK_SIZE) * BLOCK_SIZE,
      dirX: randDir === 1 ? 1 : 0,
      dirY: randDir === 0 ? 1 : 0,
    });

    socket.emit("c-snake-update", snake.getInfo());
  }, 500);
};

const onSocketFoodUpdate = (sData) => {
  console.log("sData", sData);
  foods = [];
  sData.forEach(({ x, y }) => {
    foods.push(
      new Food({
        x,
        y,
      })
    );
  });
};

const onSocketSnakeUpdate = (snakeInfo) => {
  console.log("#onSocketSnakeUpdate");
  console.log("#onSocketSnakeUpdate snakeInfo", snakeInfo);
  const colors = ["blue", "darkblue", "lightblue", "orange"];
  const rColor = parseInt(Math.random() * colors.length);
  let curSnake = snakes.find((snake) => snake.id === snakeInfo.id);
  if (!curSnake) {
    snakes.push(
      new Snake({
        ...snakeInfo,
        color: colors[rColor],
      })
    );
  } else {
    curSnake.x = snakeInfo.x;
    curSnake.y = snakeInfo.y;
    curSnake.dirX = snakeInfo.dirX;
    curSnake.dirY = snakeInfo.dirY;
    curSnake.length = snakeInfo.length;
  }
};

socket.on("connect", onSocketConnect);
socket.on("s-food-update", onSocketFoodUpdate);
socket.on("s-snake-update", onSocketSnakeUpdate);
