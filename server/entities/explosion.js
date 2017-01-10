var Entity = require('./entity.js');

class Asteroid extends Entity {
	
	constructor (source) {

		super();

		this.type = "explosion";
		this.ttl = 500;
		this.public.ttlmax = 500;

		// Inherit position, velocity and mass from source
		this.mass = source.mass;
        this.position.from(source.position.copy());
        this.velocity.from(source.velocity.copy());

	};

};

module.exports = Asteroid;