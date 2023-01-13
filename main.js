const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;
const tileSize = 40;
const tileCount = canvas.width / tileSize;
const mapWidth = tileCount;
const mapHeight = tileCount;

const start = {x: 0, y: 0}
const end = {x: tileCount - 1, y: tileCount - 1};

const walls = new Set();
const wallsPos = ["0,2", "1,2", "2,2", "10,10", "10,11", "10,12", "10,13", "10,14", "10,15", "11,10", "12,10", "13,10", "3,7", "4,7", "5,7", "6,7", "7,7", "7,8", "7,9", "7,10", "0,13", "1,13", "2,13", "3,13", "10,1", "9,1", "8,0", "8,1", "8,2", "8,3", "8,4", "5,4", "5,5", "5,6", "13,7", "13,8", "13,9", "13,6", "14,6", "15,6", "16,6", "17,6", "18,6", "19,6", "6,19", "6,18", "6,17", "5,17", "4,17", "19,14", "18,14", "17,14", "16,14", "15,14", "15,13"];
wallsPos.forEach(w => walls.add(w));

drawMap(walls, start, end);
let searchInterval = null;
let searching = false;

document.getElementById("start").addEventListener("click", () => {
    const searchOption = document.getElementById("search").value;
    const allowDiag = document.getElementById("allow-diag").checked;
    const directions = !allowDiag ? [[1, 0], [0, 1], [-1, 0], [0, -1]] :
    [[1, 0], [0, 1], [-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(walls, start, end);
    clearInterval(searchInterval);
    searchInterval = null;
    searching = false;
    switch(searchOption) {
        case "bfs":
            bfs(start, end, directions);
            break;
        case "a*":
            aStar(start, end, directions);
            break;
        default:
            break;
    }

});

document.getElementById("reset").addEventListener("click", () => {
    clearInterval(searchInterval);
    searchInterval = null;
    searching = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(walls, start, end);
});

document.getElementById("clear").addEventListener("click", () => {
    if(!searching) {
        walls.clear();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(walls, start, end);
    }
});

function bfs(start, end, directions) {
    searching = true;
    const visited = new Set();
    const startPos = {
        x: start.x,
        y: start.y,
        path: new Set()
    }
    startPos.path.add(`${start.x},${start.y}`);
    const queue = [startPos];
    //const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    searchInterval = setInterval(() => {
        if(queue.length === 0) {
            searching = false;
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
                    searching = false;
                    clearInterval(searchInterval);
                    return;
                }
                else if(!visited.has(`${x},${y}`)) {
                    queue.push({
                        x: x,
                        y: y,
                        path: new Set(path)
                    });
                    visited.add(`${x},${y}`);
                }
            }
        }
    }, 25);
}

function aStar(start, end, directions) {
    searching = true;
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);
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
    //const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    searchInterval = setInterval(() => {
        if(queue.length === 0) {
            searching = false;
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
                    searching = false;
                    clearInterval(searchInterval);
                    return;
                }
                else if(!visited.has(`${x},${y}`)) {
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
    }, 25);
}

function distance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

function drawMap(walls, pos, end, path = new Set(), visited = new Set()) {
    for(let i = 0; i < tileCount; i++) {
        for(let j = 0; j < tileCount; j++) {
            if(path.has(`${j},${i}`)) {
                ctx.fillStyle = "lightblue";
                ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
            }
            else if(visited.has(`${j},${i}`)) {
                ctx.fillStyle = "lightgreen";
                ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
            }
            else if(walls.has(`${j},${i}`)) {
                ctx.fillStyle = "#333";
                ctx.fillRect(j * tileSize, i * tileSize, tileSize , tileSize);
            }
        }
    }

    ctx.fillStyle = "red";
    ctx.fillRect(end.x * tileSize, end.y * tileSize, tileSize, tileSize);

    ctx.fillStyle = "blue";
    ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    for(let i = 1; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize + 0.5);
        ctx.lineTo(tileSize * tileCount, i * tileSize + 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i * tileSize + 0.5, 0);
        ctx.lineTo(i * tileSize + 0.5, tileSize * tileCount);
        ctx.stroke();
    }
}

canvas.addEventListener("mousedown", (event) => {
    if(searching) {
        return;
    }
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(Math.floor((event.clientX - rect.left) / tileSize), tileCount - 1);
    const y = Math.min(Math.floor((event.clientY - rect.top) / tileSize), tileCount - 1);
    if(!walls.has(`${x},${y}`)) {
        walls.add(`${x},${y}`);
        ctx.fillStyle = "#333";
    }
    else {
        walls.delete(`${x},${y}`);
        ctx.fillStyle = "#fff";
    }
    ctx.fillRect(x > 0 ? x * tileSize + 1 : 0, y > 0 ? y * tileSize + 1 : 0,
        tileSize - (x > 0 ? 1 : 0), tileSize - (y > 0 ? 1 : 0));
    console.log("x: " + x + " y: " + y);
})