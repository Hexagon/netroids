var Entity = require('./entity.js'),
	Vector = require('../util/vector.js');

class Bullet extends Entity {
	constructor (source) {

		super();

		this.type = "bullet";
		this.mass = 5;
		this.ttl = 1500;

		// Inherit position and velocity from source
        this.position.from(source.position.copy());
        this.velocity.from(source.velocity.copy());

        // Add velocity in the direction the source is rotated towards
        this.velocity.add(new Vector(Math.cos(source.rotation.d), Math.sin(source.rotation.d) ));

		this.collides.push(...["asteroid", "player"]);

		this.public = Object.assign(this.public, {
			"owner": source.uuid,
			"damage": 5
		});

	};

	collidedWith (that) {

		var owner = this.public.owner;

		// A bullet cannot hurt it's owner
		if (that.uuid == owner) return;

		// Remove target HP/Shield
		if (that.public.shield) {
			that.public.shield.current -= this.public.damage;
			if( that.public.shield.current < 0) {
				that.public.hp.current += that.public.shield.current;
				that.public.shield.current = 0;
			}
		} else {
			that.public.hp.current -= this.public.damage;
		}

		// This bullet is dead
		this.pendingRemoval = true;

		// Both this and that is updated
		this.local.updated = true;
		that.local.updated = true;

	};

};

module.exports = Bullet;