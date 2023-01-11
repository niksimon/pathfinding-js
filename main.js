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

const walls = new Set();
walls.add("0,2");
walls.add("1,2");
walls.add("2,2");
walls.add("10,10");
walls.add("10,11");
walls.add("10,12");
walls.add("10,13");
walls.add("10,14");
walls.add("10,15");
walls.add("11,10");
walls.add("12,10");
walls.add("13,10");
walls.add("3,7");
walls.add("4,7");
walls.add("5,7");
walls.add("6,7");
walls.add("7,7");
walls.add("7,8");
walls.add("7,9");
walls.add("7,10");
walls.add("0,13");
walls.add("1,13");
walls.add("2,13");
walls.add("3,13");
walls.add("10,1");
walls.add("9,1");
walls.add("8,0");
walls.add("8,1");
walls.add("8,2");
walls.add("8,3");
walls.add("8,4");
walls.add("7,4");
walls.add("6,4");
walls.add("5,4");
walls.add("5,5");
walls.add("5,6");
walls.add("13,6");
walls.add("14,6");
walls.add("15,6");

ctx.strokeStyle = "#333";
for(let i = 0; i < tileCount; i++) {
    for(let j = 0; j < tileCount; j++) {
        ctx.strokeRect(j * tileSize, i * tileSize, tileSize, tileSize);
    }
}

drawMap(walls, start, end);
let searchInterval = null;

document.getElementById("start").addEventListener("click", () => {
    const searchOption = document.getElementById("search").value;
    drawMap(walls, start, end);
    clearInterval(searchInterval);
    searchInterval = null;
    switch(searchOption) {
        case "bfs":
            bfs(start, end);
            break;
        case "a*":
            aStar(start, end);
            break;
        default:
            break;
    }

});

function bfs(start, end) {
    const visited = new Set();
    const startPos = {
        x: start.x,
        y: start.y,
        path: new Set()
    }
    startPos.path.add(`${start.x},${start.y}`);
    const queue = [startPos];
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    searchInterval = setInterval(() => {
        if(queue.length === 0) {
            clearInterval(searchInterval);
            return;
        }

        const currentPos = queue.shift();

        drawMap(walls, currentPos, end, currentPos.path, visited);

        for(const d of directions) {
            const path = new Set(currentPos.path);
            let x = currentPos.x;
            let y = currentPos.y;

            x += d[0];
            y += d[1];

            path.add(`${x},${y}`);

            if(x >= 0 && x < mapWidth && y >= 0 && y < mapHeight && !walls.has(`${x},${y}`)) {
                if(x === end.x && y === end.y) {
                    drawMap(walls, {x: x, y: y}, end, path, visited);
                    clearInterval(searchInterval);
                    return;
                }
                else if(!walls.has(`${x},${y}`) && !visited.has(`${x},${y}`)) {
                    queue.push({
                        x: x,
                        y: y,
                        path: new Set(path)
                    });
                    visited.add(`${x},${y}`);
                }
            }
        }
    }, 50);
}

function aStar(start, end) {
    const visited = new Set();
    const distFromStart = {};
    const distToEnd = {};
    distFromStart[`${start.x},${start.y}`] = 0;

    const startPos = {
        x: start.x,
        y: start.y,
        path: new Set(),
        priority: 0,
    }

    startPos.path.add(`${start.x},${start.y}`);
    const queue = [startPos];
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    searchInterval = setInterval(() => {
        if(queue.length === 0) {
            clearInterval(searchInterval);
            return;
        }

        const currentPos = queue.shift();

        drawMap(walls, currentPos, end, currentPos.path, visited);

        for(const d of directions) {
            const path = new Set(currentPos.path);
            let x = currentPos.x;
            let y = currentPos.y;

            x += d[0];
            y += d[1];

            path.add(`${x},${y}`);

            if(x >= 0 && x < mapWidth && y >= 0 && y < mapHeight && !walls.has(`${x},${y}`)) {
                if(x === end.x && y === end.y) {
                    drawMap(walls, {x: x, y: y}, end, path, visited);
                    clearInterval(searchInterval);
                    return;
                }
                else if(!walls.has(`${x},${y}`) && !visited.has(`${x},${y}`)) {
                    distFromStart[`${x},${y}`] = distFromStart[`${currentPos.x},${currentPos.y}`] + 1;
                    distToEnd[`${x},${y}`] = distance({x: x, y: y}, {x: end.x, y: end.y});
                    const priority = distFromStart[`${x},${y}`] + distToEnd[`${x},${y}`];
                    queue.push({
                        x: x,
                        y: y,
                        path: new Set(path),
                        priority: priority
                    });
                    visited.add(`${x},${y}`);
                }
            }
        }

        queue.sort((a, b) => a.priority - b.priority);
    }, 50);
}

function distance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

function drawMap(walls, pos, end, path = new Set(), visited = new Set()) {
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
            else if(walls.has(`${j},${i}`)) {
                ctx.fillStyle = "#333";
            }
            else {
                ctx.fillStyle = "#fff";
            }
            ctx.fillRect(j * tileSize + offsetX, i * tileSize + offsetY, tileSize - offsetWidth, tileSize - offsetHeight);
        }
    }

    ctx.fillStyle = "red";
    const endOffset = {x: end.x === 0 ? 0 : 1, y: end.y === 0 ? 0 : 1,
        width: end.x === 0 || end.x === tileCount - 1 ? 1 : 2, height: end.y === 0 || end.y === tileCount - 1 ? 1 : 2};
    ctx.fillRect(end.x * tileSize + endOffset.x, end.y * tileSize + endOffset.y, tileSize - endOffset.width, tileSize - endOffset.height);

    ctx.fillStyle = "blue";
    const posOffset = {x: pos.x === 0 ? 0 : 1, y: pos.y === 0 ? 0 : 1,
        width: pos.x === 0 || pos.x === tileCount - 1 ? 1 : 2, height: pos.y === 0 || pos.y === tileCount - 1 ? 1 : 2};
    ctx.fillRect(pos.x * tileSize + posOffset.x, pos.y * tileSize + posOffset.y, tileSize - posOffset.width, tileSize - posOffset.height);
}