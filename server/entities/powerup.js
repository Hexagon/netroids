var Entity = require('./entity.js'),
	Vector = require('../util/vector.js');

class PowerUp extends Entity {

	constructor (source) {

		super();

		this.type = "powerup";
		this.mass = 15;
		this.ttl = 60000;

		// Inherit position and velocity from source
        this.position.from(source.position);
        this.velocity.from(source.velocity);

		this.public = Object.assign(this.public, {
			dropped: false
		});

		this.local = Object.assign(this.local, {
			drops: [
				{
			    subtype: "rapid",
			    class: "weapon",
			    probability: 0.4
			  },
			  {
			    subtype: "spread",
			    class: "weapon",
			    probability: 0.2
			  },
			  {
			    subtype: "damage",
			    class: "weapon",
			    probability: 0.4
			  }
			]
		});

		// Which?
		var dropped, possibleDrop, oneTime = false;
		while(!this.public.dropped || (oneTime && false /* Future use */)) {

			// Select one weapon
			possibleDrop = this.local.drops[Math.round(Math.random()*(this.local.drops.length-1))];
			
			// Check if it dropped
			if(possibleDrop.probability >= Math.random()) {
				this.public.dropped = possibleDrop;
			}

			oneTime = true;

		}

	};

};

module.exports = PowerUp;