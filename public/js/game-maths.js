class Point {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} angle
     * @param {boolean} check
     */
    constructor(x, y, angle = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }
}

class Segment {
    /**
     * @param {Point} A
     * @param {Point} B
     */
    constructor(A, B) {
        this.A = A;
        this.B = B;
        this.n = { x: B.y - A.y, y: A.x - B.x };
    }
}

/**
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} D
 */
function lineLineIntersection(A, B, C, D, ray = false) {
    if ((B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x) === 0)
        return null;

    const den = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
    const t = ((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / den;
    const u = ((B.x - A.x) * (A.y - C.y) - (B.y - A.y ) * (A.x - C.x)) / den;

    if (t < 0 || (!ray && t > 1) || u < 0 || u > 1)
        return null;
    
    return new Point(A.x + t * (B.x - A.x), A.y + t * (B.y - A.y));
}

/**
 * @param {Point} position
 * @param {number} radius
 * @param {Segment[]} walls 
 */
function fieldOfView(position, radius, walls) {
    const points = [];

    for (const { A, B } of walls) {
        const angleA = Math.atan2(A.y - position.y, A.x - position.x);
        const angleB = Math.atan2(B.y - position.y, B.x - position.x);

        points.push(new Point(A.x, A.y, angleA), new Point(B.x, B.y, angleB));
    }

    const hits = [];

    for (const point of points) {
        const rayA = new Point(position.x + radius*Math.cos(point.angle - 0.0001), position.y + radius*Math.sin(point.angle - 0.0001));
        const rayB = new Point(position.x + radius*Math.cos(point.angle + 0.0001), position.y + radius*Math.sin(point.angle + 0.0001));

        let closest = point;
        let closestRayA = null;
        let closestRayB = null;

        for (const wall of walls) {
            const hit = lineLineIntersection(position, closest, wall.A, wall.B);
            if (hit !== null)
                closest = hit;

            const hitRayA = lineLineIntersection(position, rayA, wall.A, wall.B, true);
            if (hitRayA !== null && (closestRayA === null || Math.hypot(hitRayA.x - position.x, hitRayA.y - position.y) < Math.hypot(closestRayA.x - position.x, closestRayA.y - position.y)))
                closestRayA = hitRayA;
            
            const hitRayB = lineLineIntersection(position, rayB, wall.A, wall.B, true);
            if (hitRayB !== null && (closestRayB === null || Math.hypot(hitRayB.x - position.x, hitRayB.y - position.y) < Math.hypot(closestRayB.x - position.x, closestRayB.y - position.y)))
                closestRayB = hitRayB;
        }

        closest.angle = point.angle;
        hits.push(closest);

        if (closestRayA !== null) {
            closestRayA.angle = point.angle - 0.0001;
            hits.push(closestRayA);
        }

        if (closestRayB !== null) {
            closestRayB.angle = point.angle + 0.0001;
            hits.push(closestRayB);
        }
    }

    return hits.sort((A, B) => A.angle - B.angle);
}