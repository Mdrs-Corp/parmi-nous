import { distance, lineLineIntersection, Point, Segment } from './maths';

class PlayerSafe {
    name;
    color;
    alive;
    position;
    viewDistance;
    frame;
    flipped;

    constructor({ name, color, alive, position, viewDistance, frame, flipped }: Player) {
        this.name = name;
        this.color = '#00ff00'; //color;
        this.alive = alive;
        this.position = position;
        this.viewDistance = viewDistance;
        this.frame = frame;
        this.flipped = flipped;
    }
}

class Player {
    id;
    name;
    color = '#ff0000';

    ready = false;

    alive = true;
    impostor = false;

    position = new Point(10, 10);
    speed = 5;
    dx = 0;
    dy = 0;
    viewDistance = 200;
    visible: PlayerSafe[] = [];

    frame = 0;
    df = 1;
    flipped = false;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    update(players: Map<string, Player>, walls: Segment[]) {
        if (this.alive) {
            this.move(walls);
            this.sight(players, walls);
        }
    }

    move(walls: Segment[]) {
        let closest = new Point(this.position.x + this.dx, this.position.y + this.dy);

        for (const wall of walls) {
            const hit = lineLineIntersection(this.position, closest, wall.A, wall.B, 0.001);
            if (hit !== null)
                closest = hit;
        }

        this.position.x = closest.x;
        this.position.y = closest.y;
    }

    sight(players: Map<string, Player>, walls: Segment[]) {
        this.visible = [];

        players.forEach((player, id) => {
            if (id !== this.id && distance(this.position, player.position) <= this.viewDistance) {
                let visible = true;
                
                for (const wall of walls) {
                    if (lineLineIntersection(this.position, player.position, wall.A, wall.B) !== null) {
                        visible = false;
                        break;
                    }
                }

                if (visible)
                    this.visible.push(player.safe());
            }
        })
    }

    updateAnimationFrame() {
        if (this.dx !== 0 || this.dy !== 0) {
            if (this.frame === 0) {
                this.frame = 3;
                this.df = 1;
                return;
            }
            this.frame += this.df;
            if (this.frame === 3 || this.frame === 8)
                this.df = -this.df;
        }
        else
            this.frame = 0;
    }

    updateDirection(x: number, y: number) {
        this.dx = Math.sign(x) * this.speed * (y === 0 ? 1 : Math.SQRT2/2);
        this.dy = Math.sign(y) * this.speed * (x === 0 ? 1 : Math.SQRT2/2);

        if (x === -1)
            this.flipped = true;
        else if (x === 1)
            this.flipped = false;
    }

    safe() {
        return new PlayerSafe(this);
    }
}

export { Player }