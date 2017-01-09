var Entity = require('./entity.js');

class Asteroid extends Entity {
	constructor () {

		super();

		this.type = "asteroid";
		this.mass = 25;
		
	  	this.public = Object.assign(this.public, {
	  		"hp": {
	  			"current": 100,
	  			"max": 100
	  		}
	  	});


	};

};

module.exports = Asteroid;