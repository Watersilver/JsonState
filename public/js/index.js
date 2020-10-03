import JsonState from "./JsonState/index.js";

// initialize state
window.erty = new JsonState(JSON.stringify({
  width: 8,
  height: 8,
  pos: {x: 0, y: 0}
}));

const moveCreator = coord => sign => {
  const p = erty.pos;
  if (sign === "+" && p[coord] < erty[coord === "x" ? "width" : "height"] - 1) {
    p[coord] += 1;
  } else if (sign === "-" && p[coord] > 0) {
    p[coord] -= 1;
  }
}
const moveX = moveCreator("x");
const moveY = moveCreator("y");

// build presentation
const bodyEl = document.getElementsByTagName("body")[0];
bodyEl.style.margin = 0;
bodyEl.style.padding = 0;
const mainEl = document.getElementsByTagName("main")[0];
mainEl.style.border = "thick double #32a1ce";
mainEl.style.boxSizing = "border-box";
mainEl.style.width = "100vw";
mainEl.style.height = "100vh";
mainEl.style.display = "grid";
mainEl.style.gap = "10px";
mainEl.style.gridTemplateColumns = `repeat(${erty.width}, 1fr)`;
mainEl.style.gridAutoRows = "1fr";
const squares = [];
for (let i = 0; i < erty.height; i++) {
  squares[i] = [];
  for (let j = 0; j < erty.width; j++) {
    const square = document.createElement("div");
    square.innerHTML = `${i} ${j}`;
    mainEl.appendChild(square);
    square.style.display = "grid";
    square.style.placeItems = "center";
    square.style.border = "1px solid black";
    squares[i][j] = square;
  }
}
const player = document.createElement("div");
const plSize = 20;
player.style.width = `${plSize}px`;
player.style.height = `${plSize}px`;
player.style.position = "absolute";
player.style.left = 0;
player.style.top = 0;
player.style.overflow = "visible";
player.style.transition = "transform 400ms cubic-bezier(.47,1.64,.41,.8)";
player.style.backgroundColor = "red";
player.style.borderRadius = "50%";
mainEl.appendChild(player);

// callbacks
const gotToPos = () => {
  const squarePos = squares[erty.pos.y][erty.pos.x].getBoundingClientRect();
  const newX = squarePos.left + (squarePos.right - squarePos.left - plSize) * 0.5;
  const newY = squarePos.top + (squarePos.bottom - squarePos.top - plSize) * 0.5;
  player.style.transform = `translate(${newX}px, ${newY}px)`;
}
gotToPos();
window.addEventListener("resize", gotToPos)

erty.addCallbackToPath("pos", gotToPos);

// control
document.addEventListener("keydown", e => {

  switch (e.key) {
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      moveY("+");
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      moveY("-");
      // Do something for "up arrow" key press.
      break;
    case "Left": // IE/Edge specific value
    case "ArrowLeft":
      moveX("-");
      // Do something for "left arrow" key press.
      break;
    case "Right": // IE/Edge specific value
    case "ArrowRight":
      moveX("+");
      // Do something for "right arrow" key press.
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }
})