class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Create a copy of this vector
    copy() {
        return new Vector2(this.x, this.y);
    }

    // Add another vector to this one
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    // Subtract another vector from this one
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    // Multiply by a scalar
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // Get the magnitude (length) of the vector
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Normalize the vector (make it unit length)
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    // Get distance to another vector
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if two vectors are equal (within tolerance)
    equals(other, tolerance = 0.001) {
        return Math.abs(this.x - other.x) < tolerance && 
               Math.abs(this.y - other.y) < tolerance;
    }

    // Static methods for common operations
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    static multiply(v, scalar) {
        return new Vector2(v.x * scalar, v.y * scalar);
    }

    static distance(v1, v2) {
        return v1.distanceTo(v2);
    }

    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
}
