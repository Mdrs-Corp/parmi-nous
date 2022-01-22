import { Socket } from 'socket.io';
import { Player } from './player';
import { Point, Segment } from './maths';

class Game {
    id;
    sockets: Map<string, Socket> = new Map();
    players: Map<string, Player> = new Map();
    pending: Map<string, string> = new Map();

    owner: string | null = null;
    open = true;
    ready = false;
    playing = false;

    walls: Segment[] = [Segment.from(2600, 0, 0, 0), Segment.from(2600, 2400, 2600, 0), Segment.from(0, 2400, 2600, 2400), Segment.from(0, 0, 0, 2400),
        Segment.from(100, 100, 200, 100), Segment.from(200, 100, 200, 200), Segment.from(200, 200, 100, 200), Segment.from(100, 200, 100, 100)];

    constructor(id: string) {
        this.id = id;
    }

    waitPlayer(id: string, name: string) {
        this.pending.set(id, name);
    }

    addPlayer(socket: Socket, id: string) {
        const player = new Player(id, this.pending.get(id)!);

        if (this.players.size === 0)
            this.owner = id;
        this.sockets.set(id, socket);
        this.players.set(id, player);
        this.pending.delete(id);

        return player;
    }

    removePlayer(id: string) {
        this.sockets.delete(id);
        this.players.delete(id);
        if (this.owner === id)
            this.owner = [...this.players.keys()][0];
    }

    playerReady(id: string) {
        this.players.get(id)!.ready = true;

        this.ready = true;
        this.players.forEach(player => {
            if (!player.ready) {
                this.ready = false;
                return;
            }
        })
    }

    setImpostors(n: number) {
        let remaining = this.players.size;
        this.players.forEach(player => {
            if (Math.random() * remaining < n) {
                player.impostor = true;
                n--;
            }
            remaining--;
        })
    }

    update() {
        this.players.forEach(player => {
            player.update(this.players, this.walls);
        })

        this.sockets.forEach((socket, id) => {
            const player = this.players.get(id)!;
            socket.emit('update', player);
        })
    }

    updateAnimationFrame() {
        this.players.forEach(player => {
            player.updateAnimationFrame();
        })
    }

    getInfo() {

      const players: { id: string, name: string }[] = [];
      this.players.forEach(player => {
        players.push({id: player.id, name: player.name});
      });

      return {
        players: players,
        owner: this.owner,
      };
    }
}

export { Game }
