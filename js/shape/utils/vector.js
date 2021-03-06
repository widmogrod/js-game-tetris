define(['shape/point/point'], function(Point) {
    function VectorUtil(vector) {
        this.vector = vector instanceof Point ? vector : new Point(0,0,0);
    }

    VectorUtil.prototype.add = function(vector) {
        return new VectorUtil(new Point(
            this.vector.x + vector.x,
            this.vector.y + vector.y,
            this.vector.z + vector.z
        ));
    }
    VectorUtil.prototype.dot = function(vector) {
        return (this.vector.x * vector.x) + (this.vector.y * vector.y) + (this.vector.z * vector.z);
    }
    VectorUtil.prototype.direction = function(vector) {
        return (this.vector.x - vector.x) + (this.vector.y - vector.y) + (this.vector.z - vector.z) > 0 ? 1 : -1;
    }
    VectorUtil.prototype.angle = function(vector) {
        var divisor = this.vector.length() * vector.length();
        if (divisor === 0) return null;

        var angle = this.dot(vector) / divisor;

        if (angle < -1) { angle = -1; }
        if (angle > 1) { angle = 1; }

        return Math.acos(angle);
    }
    VectorUtil.normalFromPoints = function(point0, point1, point2) {
        // vectors on the plane
        var U = new Point(point1.getAt(0, 0) - point0.getAt(0, 0), point1.getAt(1, 0) - point0.getAt(1, 0), point1.getAt(2, 0) - point0.getAt(2, 0));
        var V = new Point(point2.getAt(0, 0) - point0.getAt(0, 0), point2.getAt(1, 0) - point0.getAt(1, 0), point2.getAt(2, 0) - point0.getAt(2, 0));

        return cross(U, V);
    }
    VectorUtil.cross = cross;
    function cross(U, V) {
        var i, j, k;

        i = U.getAt(1, 0) * V.getAt(2, 0) - U.getAt(2, 0) * V.getAt(1, 0);
        j = U.getAt(2, 0) * V.getAt(0, 0) - U.getAt(0, 0) * V.getAt(2, 0);
        k = U.getAt(0, 0) * V.getAt(1, 0) - U.getAt(1, 0) * V.getAt(0, 0);

        return new Point(i, -j, k);
    }
    return VectorUtil;
})
