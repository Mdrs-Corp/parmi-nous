let debug = true;

/**
 * @typedef Player
 * @property {string} name
 * @property {string} color
 * @property {Point} position
 * @property {number} viewDistance
 * @property {boolean} alive
 * @property {number} frame
 * @property {boolean} flipped
 * @property {Player[]} visible 
 */

/** @type {Map<string, HTMLImageElement>} */
const sprites = new Map();

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const cw = canvas.width;
const ch = canvas.height;
// res px sur le canvas = 1 en jeu
let res = 2;
/** @type {Segment[]} */
let walls = [];

socket.on('update', player => {
    requestAnimationFrame(() => draw(player));
})

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Player} player
 */
function draw(player) {  
    const origin = new Point(player.position.x - cw/(2*res), player.position.y - ch/(2*res));

    ctx.clearRect(0, 0, cw, ch);
    drawEnvironment(origin);

    const facingWalls = walls.filter(wall => wall.n.x * (wall.A.x - player.position.x) + wall.n.y * (wall.A.y - player.position.y) <= 0);
    const hits = fieldOfView(player.position, player.viewDistance, facingWalls);

    drawFieldOfView(origin, player, hits);
    if (debug)
        drawDebug(origin, facingWalls, hits);

    drawPlayer(origin, player);

    for (const p of player.visible)
        drawPlayer(origin, p);
}

/** @param {Point} origin */
function drawEnvironment(origin) {
    ctx.drawImage(sprites.get('map'), origin.x, origin.y, cw/res, ch/res, 0, 0, cw, ch);
    ctx.fillStyle = '#000000cf';
    ctx.fillRect(0, 0, cw, ch);
}

const playerCanvas = document.createElement('canvas');
const playerCtx = playerCanvas.getContext('2d');

/**
 * @param {Point} origin
 * @param {Player} player
 */
function drawPlayer(origin, player) {
    const spriteOffset = player.frame * 100;

    // on dessine amogus sur son propre canvas ඞ
    playerCtx.save();
    playerCtx.clearRect(0, 0, 100, 100);

    if (player.flipped) {
        playerCtx.translate(100, 0);
        playerCtx.scale(-1, 1);
    }
    // on dessine l'ombre de amogus pour pouvoir la colorer ඞ
    playerCtx.drawImage(sprites.get('player'), spriteOffset, 100, 100, 100, 0, 0, 100, 100);
    playerCtx.globalCompositeOperation = 'source-atop';
    playerCtx.fillStyle = player.color;
    playerCtx.fillRect(0, 0, 100, 100);

    playerCtx.globalCompositeOperation = 'source-over';
    playerCtx.drawImage(sprites.get('player'), spriteOffset, 0, 100, 100, 0, 0, 100, 100);
    playerCtx.restore();

    const x = (player.position.x - origin.x)*res - 50;
    const y = (player.position.y - origin.y)*res - 90;
    ctx.drawImage(playerCtx.canvas, x, y);
}

/**
 * @param {Point} origin
 * @param {Player} player
 * @param {Point[]} hits
 */
function drawFieldOfView(origin, player, hits) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo((hits[hits.length - 1].x - origin.x)*res, (hits[hits.length - 1].y - origin.y)*res);

    for (const point of hits)
        ctx.lineTo((point.x - origin.x)*res, (point.y - origin.y)*res);

    ctx.clip();
    ctx.drawImage(sprites.get('map'), origin.x, origin.y, cw/res, ch/res, 0, 0, cw, ch);

    const x = (player.position.x - origin.x)*res;
    const y = (player.position.y - origin.y)*res;
    const grad = ctx.createRadialGradient(x, y, 50, x, y, player.viewDistance*2);
    grad.addColorStop(0, '#00000000');
    grad.addColorStop(1, '#000000cf');
    ctx.fillStyle = grad;
    ctx.fill();
    
    // sans ça y a des bordures sus
    ctx.strokeStyle = '#0000008f';
    ctx.stroke();

    ctx.restore();
}

let once = true;
// Debug: les murs, vecteurs normaux et totu le reste
/**
 * @param {Point} origin
 * @param {Segment[]} walls
 * @param {Point[]} hits
 */
function drawDebug(origin, walls, hits) {
    ctx.save();
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ff0000';

    for (const wall of walls) {
        ctx.beginPath();
        ctx.strokeStyle = '#36ba45';
        ctx.moveTo((wall.A.x - origin.x)*res, (wall.A.y - origin.y)*res);
        ctx.lineTo((wall.B.x - origin.x)*res, (wall.B.y - origin.y)*res);
        ctx.stroke();

        const x = (wall.A.x + wall.B.x)/2;
        const y = (wall.A.y + wall.B.y)/2;
        const angle = Math.atan2(wall.n.y, wall.n.x);

        ctx.beginPath();
        ctx.strokeStyle = '#f5bc36';
        ctx.moveTo((x - origin.x)*res, (y - origin.y)*res);
        ctx.lineTo((x - origin.x + 50*Math.cos(angle))*res, (y - origin.y + 50*Math.sin(angle))*res);
        ctx.stroke();
    }

    for (const point of hits) {
        ctx.beginPath();
        ctx.arc((point.x - origin.x)*res, (point.y - origin.y)*res, 5, 0, 2*Math.PI);
        ctx.fill();
    }

    ctx.restore();
}

//#region on charge tout
displayEvent('[info] Chargement des sprites...', 'sys-event');

const request = new XMLHttpRequest();
request.open('GET', '/images/sprites.json');
request.responseType = 'json';
request.send();

request.onload = () => {
    const data = request.response;
    const n = Object.keys(data).length;
    let count = 0;

    for (const name in data) {
        const sprite = new Image();
        sprite.src = `/images/${data[name]}`;
        sprites.set(name, sprite);

        sprite.onload = () => {
            count++;
            if (count === n) {
                socket.emit('loaded');
                displayEvent('[info] Terminé !', 'sys-event');
            }
        }
    }
}

socket.on('load', (data) => {
    for (const wall of data.walls) {
        walls.push(new Segment(wall.A, wall.B));
    }
})
//#endregion