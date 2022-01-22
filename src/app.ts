import express from 'express';
import http from 'http';
import cookieparser from 'cookie-parser';
import { Server } from 'socket.io';

import { Game } from './game';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('views', 'views');
app.set('viewengine', 'pug');
app.use(express.static('public'));
app.use(cookieparser());

const port = process.env.PORT || 8080;

const games: Map<string, Game> = new Map();

//#region http
app.get('/', (req, res) => {
    res.render('index.pug');
})

app.get('/game', (req, res) => {
    if (typeof req.query.name === 'string')
        res.cookie('name', req.query.name);

    if (typeof req.query.id === 'string' && games.has(req.query.id))
        res.redirect(`/game/${req.query.id}`);
    else {
        let id = randomString(4);
        while (games.has(id))
            id = randomString(4);

        games.set(id, new Game(id));
        res.redirect(`/game/${id}`);
    }
})

app.get('/game/:id', (req, res) => {
    if (typeof req.cookies?.name === 'string' && validName(req.cookies.name) && games.get(req.params.id)?.open) {
        const game = games.get(req.params.id)!;

        const used = [...game.players.keys()].concat([...game.pending.keys()]);
        let id = randomString(10);
        while (used.includes(id))
            id = randomString(10);

        game.waitPlayer(id, normalizeName(req.cookies.name));
        res.render('game.pug', { gameId: req.params.id, playerId: id });
    }
    else
        res.redirect('/');
})
//#endregion

//#region socket.io
io.on('connection', socket => {
    socket.once('initialization', (gameId: string, playerId: string) => {
        if (!games.get(gameId)?.pending.has(playerId)) {
            socket.disconnect(true);
            return;
        }

        const game = games.get(gameId)!;
        socket.join(game.id);
        const player = game.addPlayer(socket, playerId);
        io.in(game.id).emit('event', `${player.name} a rejoint le salon`);
        io.in(game.id).emit('gameInfo', game.getInfo());

        // gato
        socket.on('message', (message: string) => io.in(game.id).emit('message', player.name, message));

        // 😢
        socket.on('disconnecting', () => {
            game.removePlayer(player.id);
            if (game.players.size === 0)
                games.delete(game.id);
            io.in(game.id).emit('event', `${player.name} s'est déconnecté(e)`);
        })

        socket.on('loaded', () => game.playerReady(player.id));

        // 💻
        socket.on('update-direction', (x: number, y: number) => {
            player.updateDirection(x, y);
        })

        // le jeu ptn
        socket.on('start', () => {
            if (game.owner === player.id && game.ready && game.open) {
                game.open = false;
                game.playing = true;
                io.in(game.id).emit('event', 'La partie commence !');
                io.in(game.id).emit('load', { walls: game.walls });
            }
        })
    })
})

const framerate = 50/3;
let i = 0;
const update = () => {
    const start = Date.now();

    games.forEach(game => {
        if (game.playing) {
            game.update();
            if (i % 6 === 0) {
                game.updateAnimationFrame();
                i = 0;
            }
            i++;
        }
    })

    const elapsed = Date.now() - start;
    setTimeout(update, framerate - elapsed);
}

update();
//#endregion

server.listen(port, () => console.log('Started !'));

//#region 🛠️
const randomString = (length: number) => {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random()*62)];
    }
    return str;
}

const validName = (name: string) => {
    const match = name.match(/[a-zA-z0-9 ]{2,12}/);
    return match !== null && name === match[0];
}

const normalizeName = (name: string) => {
    return name.trim().split(/\s+/).join(' ');
}
//#endregion
