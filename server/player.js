module.exports = {
	create: function (uuid, entities) {
		var entity = entities.create({
			"uuid": uuid,
			"i": "Player 1",
			"p": {
	            "x": Math.random()*30000-15000,
	            "y": Math.random()*30000-15000
			},
			"v": {
				"x": 0.03,
				"y": 0.0
			},
			"a": {
				"d": 0.0,
				"m": 0.0
			},
			"hp": {
				"current": 125,
				"max": 125
			},
			"r": 0.0,
			"m": 25,
			"t": "player"
		});
		return entity;
	}
};
