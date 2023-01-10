const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;
const tileSize = 50;
const tileCount = canvas.width / tileSize;
const mapWidth = tileCount;
const mapHeight = tileCount;

const start = {x: 0, y: 0}
const end = {x: tileCount - 1, y: tileCount - 1};

const map = new Map();
map.set("0,2", "Wall");
map.set("1,2", "Wall");
map.set("2,2", "Wall");
map.set("10,10", "Wall");
map.set("10,11", "Wall");
map.set("10,12", "Wall");
map.set("10,13", "Wall");
map.set("10,14", "Wall");
map.set("10,15", "Wall");
map.set("11,10", "Wall");
map.set("12,10", "Wall");
map.set("13,10", "Wall");
map.set("3,7", "Wall");
map.set("4,7", "Wall");
map.set("5,7", "Wall");
map.set("6,7", "Wall");
map.set("7,7", "Wall");
map.set("7,8", "Wall");
map.set("7,9", "Wall");
map.set("7,10", "Wall");
map.set("0,13", "Wall");
map.set("1,13", "Wall");
map.set("2,13", "Wall");
map.set("3,13", "Wall");
map.set("10,1", "Wall");
map.set("9,1", "Wall");
map.set("8,0", "Wall");
map.set("8,1", "Wall");
map.set("8,2", "Wall");
map.set("8,3", "Wall");
map.set("8,4", "Wall");
map.set("7,4", "Wall");
map.set("6,4", "Wall");
map.set("5,4", "Wall");
map.set("5,5", "Wall");
map.set("5,6", "Wall");
map.set("13,6", "Wall");
map.set("14,6", "Wall");
map.set("15,6", "Wall");

ctx.strokeStyle = "#333";
for(let i = 0; i < tileCount; i++) {
    for(let j = 0; j < tileCount; j++) {
        ctx.strokeRect(j * tileSize, i * tileSize, tileSize, tileSize);
    }
}

drawMap(map, start);
let bfsInterval = null;

document.getElementById("start").addEventListener("click", () => {
    drawMap(map, start);
    clearInterval(bfsInterval);
    bfsInterval = null;
    bfs(start);
});

function bfs(start) {
    const visited = new Set();
    const startPos = {
        x: start.x,
        y: start.y,
        path: new Set()
    }
    startPos.path.add(`${start.x},${start.y}`);
    const q = [startPos];
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    bfsInterval = setInterval(() => {
        if(q.length === 0) {
            clearInterval(bfsInterval);
        }

        const currentPos = q.shift();

        drawMap(map, currentPos, currentPos.path, visited);

        for(const d of directions) {
            const path_ = new Set(currentPos.path);
            let x = currentPos.x;
            let y = currentPos.y;

            x += d[1];
            y += d[0];

            path_.add(`${x},${y}`);

            if(x >= 0 && x < mapWidth && y >= 0 && y < mapHeight && map.get(`${x},${y}`) !== "Wall") {
                if(x === end.x && y === end.y) {
                    drawMap(map, {x: x, y: y}, path_, visited);
                    clearInterval(bfsInterval);
                }
                else if(!map.has(`${x},${y}`) && !visited.has(`${x},${y}`)) {
                    q.push({
                        x: x,
                        y: y,
                        path: new Set(path_)
                    });
                    visited.add(`${x},${y}`);
                }
            }
        }
    }, 50);

    return false;
}

function drawMap(map, player, path = new Set(), visited = new Set()) {
    for(let i = 0; i < tileCount; i++) {
        for(let j = 0; j < tileCount; j++) {
            const offsetX = j === 0 ? 0 : 1;
            const offsetY = i === 0 ? 0 : 1;
            const offsetWidth = j === 0 || j === tileCount - 1 ? 1 : 2;
            const offsetHeight = i === 0 || i === tileCount - 1 ? 1 : 2;
            if(path.has(`${j},${i}`)) {
                ctx.fillStyle = "lightblue";
            }
            else if(visited.has(`${j},${i}`)) {
                ctx.fillStyle = "lightgreen";
            }
            else if(map.has(`${j},${i}`)) {
                ctx.fillStyle = "#333";
            }
            else {
                ctx.fillStyle = "#fff";
            }
            ctx.fillRect(j * tileSize + offsetX, i * tileSize + offsetY, tileSize - offsetWidth, tileSize - offsetHeight);
        }
    }

    ctx.fillStyle = "red";
    const endOffset = {x: end.x === 0 ? 0 : 1, y: end.y === 0 ? 0 : 1};
    ctx.fillRect(end.x * tileSize + endOffset.x, end.y * tileSize + endOffset.y, tileSize, tileSize);

    ctx.fillStyle = "blue";
    const playerOffset = {x: player.x === 0 ? 0 : 1, y: player.y === 0 ? 0 : 1,
        width: player.x === 0 || player.x === tileCount - 1 ? 1 : 2, height: player.y === 0 || player.y === tileCount - 1 ? 1 : 2};
    ctx.fillRect(player.x * tileSize + playerOffset.x, player.y * tileSize + playerOffset.y, tileSize - playerOffset.width, tileSize - playerOffset.height);
}