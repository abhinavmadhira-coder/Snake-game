const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box = 20;
let snake, food, score, game, d;
let speed = 100;
let paused = false;
let currentTheme = "classic";

let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highscore").textContent = "High Score: " + highScore;

function init() {
  snake = [{x: 9 * box, y: 10 * box}];
  food = randomFood();
  score = 0;
  speed = 100;
  document.getElementById("score").textContent = "Score: " + score;
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
  };
}

document.addEventListener("keydown", direction);
function direction(event) {
  if(event.keyCode == 37 && d != "RIGHT") d = "LEFT";
  else if(event.keyCode == 38 && d != "DOWN") d = "UP";
  else if(event.keyCode == 39 && d != "LEFT") d = "RIGHT";
  else if(event.keyCode == 40 && d != "UP") d = "DOWN";
  else if(event.keyCode == 80) togglePause(); // P key
}

function draw() {
  if (paused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw snake
  for(let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i == 0) ? "green" : "lightgreen";
    if(currentTheme === "neon") ctx.fillStyle = (i==0) ? "cyan" : "magenta";
    if(currentTheme === "dark") ctx.fillStyle = (i==0) ? "white" : "gray";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // move snake
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if(d == "LEFT") snakeX -= box;
  if(d == "UP") snakeY -= box;
  if(d == "RIGHT") snakeX += box;
  if(d == "DOWN") snakeY += box;

  // eat food
  if(snakeX == food.x && snakeY == food.y) {
    score++;
    document.getElementById("score").textContent = "Score: " + score;
    food = randomFood();
    if(score % 5 === 0) { // increase speed every 5 points
      clearInterval(game);
      speed = Math.max(50, speed - 10);
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  let newHead = {x: snakeX, y: snakeY};

  // game over
  if(snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
    clearInterval(game);
    let playerName = prompt("Game Over! Enter your name:");
    updateLeaderboard(score, playerName || "Player");
    if(score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("highscore").textContent = "High Score: " + highScore;
    }
    alert("Final Score: " + score);
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  for(let i = 0; i < array.length; i++) {
    if(head.x == array[i].x && head.y == array[i].y) {
      return true;
    }
  }
  return false;
}

function resetGame() {
  init();
  clearInterval(game);
  game = setInterval(draw, speed);
}

function togglePause() {
  paused = !paused;
}

function changeTheme() {
  currentTheme = document.getElementById("theme").value;
}

function updateLeaderboard(score, name) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({name, score});
  leaderboard.sort((a,b) => b.score - a.score);
  leaderboard = leaderboard.slice(0,5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  let list = document.getElementById("leaderboard");
  list.innerHTML = "";
  leaderboard.forEach(entry => {
    let li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

init();
game = setInterval(draw, speed);
updateLeaderboard(0,"");
