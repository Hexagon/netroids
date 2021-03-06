var Vector = require('../util/vector.js'),
    unid = require('../util/unid.js');

class Entity {
	constructor (_uuid) {
		this.uuid = _uuid || unid();

		this.position = new Vector();
		this.velocity = new Vector();
		this.acceleration = new Vector();
		this.rotation = { d: 0, m: 0 };

		this.mass = 1;
		this.radius = 1;

		this.type = 'untyped';

		this.ttl = undefined;

		this.pendingRemoval = false;

		// Do not collide entity with anything by default
		this.collides = [];

		// Player.public is properties specific to Player-class, and available for all players
		this.public = { 
			/* ... */
		};

		// Player.public is properties specific to Player-class, available only to the current player
		this.private = { 
			/* ... */
		};

		// Properties only avaiable to server
		this.local = { 
			updated: true,
			msBuffer: 0
		};

	}

	collide (type, all, callback) {

		var entityUUID,
			that;

		for(entityUUID in all) {
			that = all[entityUUID];

			// Do not collide with self
			if ( that === this ) return;

			// Is colliding?
			if ((this.mass + that.mass) >= this.position.distance(that.position) ) {
				this.collidedWith && this.collidedWith(that);
			}

		}
	}

	hasExpired () {

		return (this.ttl !== undefined && this.ttl <= 0);
		
	}
	
	advance (advanceMs) {

		if (this.ttl !== undefined) this.ttl -= advanceMs;

		let ladvanceMs = advanceMs + this.local.msBuffer;
		while(ladvanceMs > 17) {
			let msLeft = Math.min(ladvanceMs,17);
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity.copy().mul(msLeft));
			ladvanceMs -= msLeft;
		}
		this.local.msBuffer = ladvanceMs;

	}

	// Return custom json
	toJSON (includePrivate = false) {

		return {
			u: this.uuid,
			p: this.position,
			v: this.velocity,
			a: this.acceleration,
			m: this.mass,
			r: this.rotation,
			t: this.type,
			ttl: this.ttl,
			pu: this.public,
			pr: includePrivate ? this.private : undefined
		};

	}

}

module.exports = Entity;