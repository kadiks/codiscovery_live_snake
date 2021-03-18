require("dotenv").config();

const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

// process.env.PORT = 3000
const { PORT, MAX_FOOD, WIDTH, HEIGHT } = process.env;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

const cfg = {
  MAX_FOOD: parseInt(MAX_FOOD),
  WIDTH: parseInt(WIDTH),
  HEIGHT: parseInt(HEIGHT),
};

const getRandFoods = ({ foods = [] } = {}) => {
  while (foods.length < cfg.MAX_FOOD) {
    const newFood = getRandFood();

    const foodExist = foods.find(
      (food) => food.x === newFood.x && food.y === newFood.y
    );
    if (!foodExist) {
      foods.push(newFood);
    }
  }
  return foods;
};

const getRandFood = () => {
  const x = parseInt(getRandomInt(0, cfg.WIDTH) / 10) * 10;
  const y = parseInt(getRandomInt(0, cfg.HEIGHT) / 10) * 10;

  return {
    x,
    y,
  };
};

// https://stackoverflow.com/a/1527820/185771
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

let foods = getRandFoods();

io.on("connection", (socket) => {
  console.log(`User connected with [ID=${socket.id}]`);

  socket.on("c-snake-update", (snakeInfo) => {
    socket.broadcast.emit("s-snake-update", snakeInfo);
  });

  socket.on("c-food-eaten", (oldFood) => {
    const foodIndex = foods.findIndex(
      (f) => f.x === oldFood.x && f.y === oldFood.y
    );
    if (foodIndex) {
      foods.splice(foodIndex, 1);
      foods = getRandFoods({ foods });
      socket.broadcast.emit("s-food-update", foods);
      socket.emit("s-food-update", foods);
    }
  });

  socket.emit("s-food-update", foods);
});

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
