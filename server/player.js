module.exports = {
	create: function (uuid, entities) {
		var entity = entities.create({
			"uuid": uuid,
			"p": {
	            "x": Math.random()*30000-15000,
	            "y": Math.random()*30000-15000
			},
			"sh": {
				"current": 100,
				"max": 100
			},
			"hp": {
				"current": 125,
				"max": 125
			},
			"m": 25,
			"t": "player"
		});
		return entity;
	}
};
