class Point {
    x;
    y;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Segment {
    A;
    B;

    constructor(A: Point, B: Point) {
        this.A = A;
        this.B = B;
    }

    static from(x1: number, y1: number, x2: number, y2: number) {
        return new Segment(new Point(x1, y1), new Point(x2, y2));
    }
}

function lineLineIntersection(A: Point, B: Point, C: Point, D: Point, d = 0) {
    if ((B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x) === 0)
        return null;

    const den = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
    const t = ((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / den;
    const u = ((B.x - A.x) * (A.y - C.y) - (B.y - A.y ) * (A.x - C.x)) / den;

    if (t < 0 || t > 1 || u < 0 || u > 1)
        return null;
    
    return new Point(A.x + (t - d) * (B.x - A.x), A.y + (t - d) * (B.y - A.y));
}

function distance(A: Point, B: Point) {
    return Math.hypot(B.x - A.x, B.y - A.y);
}

export {
    Point,
    Segment,
    lineLineIntersection,
    distance
}