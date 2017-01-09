class Vector {

	constructor (x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	// Non destructive
	copy () {

		return new Vector(this.x, this.y);
		
	}

	distance (other) {

	    var dx = this.x - other.x,
	    	dy = this.y - other.y;

	    return Math.sqrt( dx*dx + dy*dy );

	}

	length () {

	    return Math.sqrt( this.x*this.x + this.y*this.y );

	}

	// Destructive
	set (x, y) {

		this.x = x;
		this.y = y;

		return this;

	}

	from (other) {

		this.x = other.x;
		this.y = other.y;

		return this;

	}

	add (other) {

		this.x += other.x;
		this.y += other.y;

		return this;

	}

	sub (other) {

		this.x -= other.x;
		this.y -= other.y;

		return this;

	}

	mul (other) {

		this.x *= other.x ? other.x : other;
		this.y *= other.y ? other.y : other;

		return this;

	}

	div (other) {

		this.x /= other.x ? other.x : other;
		this.y /= other.y ? other.y : other;

		return this;

	}

	invert () {

		this.x = -this.x;
		this.y = -this.y;

		return this;

	}

	normalize () {

	    return this.div(this.length());

	}

	rotate (deg) {

	    var rad = -deg * (Math.PI/180),
	    	cos = Math.cos(rad),
	    	sin = Math.sin(rad);

	    this.x = this.x * cos - this.y * sin;
	    this.y = this.x * sin + this.y * cos;

	    return this;
	    
	}

};

module.exports = Vector;