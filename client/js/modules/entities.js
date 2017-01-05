define(['util/vector', 'util/castrato'], function(vector, bus) {

	var exports = {},
		entities = {},

		playerUUID,

		create = function (freshEntity) {
			if (!freshEntity) return;

			let oldEntity = entities[freshEntity.uuid];

			entities[freshEntity.uuid] = freshEntity;
			
			if (oldEntity) {
				entities[freshEntity.uuid].p.x = (entities[freshEntity.uuid].p.x + oldEntity.p.x * 3) / 4;
				entities[freshEntity.uuid].p.y = (entities[freshEntity.uuid].p.y + oldEntity.p.y * 3) / 4;
			}

			return entities[freshEntity.uuid];
		},

		remove = function (id) {
			delete entities[id];
		};

	bus.on('network:entities', function (data) {
		if (!data) return;
		for(eIdx in data) {
			create(data[eIdx]);		
		}
	});

	bus.on('network:remove', function (data) {
		if (!data) return;
		remove(data);
	});

	bus.on('network:player', function (data) {
		if (!data) return;
		playerUUID = data;
	});

	return {
		getCurrentPlayer: function () {
			return entities[playerUUID];
		},
		advance: function (advanceMs) {

			for(entityIdx in entities) {

				let entity = entities[entityIdx];

				// Apply velocity to position
				entity.p.x += entity.v.x * (advanceMs);
				entity.p.y += entity.v.y * (advanceMs);

			}

		},
		all: function () {
			return entities;
		}
	}

	return exports;
});