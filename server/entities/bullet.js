var Entity = require('./entity.js'),
	Vector = require('../util/vector.js'),
	Explosion = require('./explosion.js'),

    inventory = require('./');

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

		this.local = Object.assign(this.local, {
			"score": 0 /* The bulled produced this score */
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

		// Set hit score
		if (that.type == "asteroid" ) 	this.local.score = 5;		
		if (that.type == "player" ) 	this.local.score = 10;		

		// If target is player, and died, set kill score and spawn explosion		
		if (that.type == "player" && that.public.hp.current <= 0 ) {

			this.local.score += 100;
			that.local.killer = owner;

			// Spawn explosion at end of event queue
			let explosion = new Explosion(that);
			inventory.add(explosion);	

		}

		// If target is asteroid and died, spawn explosion
		if (that.type == "asteroid" && that.public.hp.current <= 0 ) {
		  
			// Spawn explosion at end of event queue
			setImmediate(function () {
				let explosion = new Explosion(that);
				inventory.add(explosion);	
			});

		}

		// This bullet is dead
		this.pendingRemoval = true;

		// Both this and that is updated
		this.local.updated = true;
		that.local.updated = true;

	};

};

module.exports = Bullet;