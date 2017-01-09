define(['util/vector', 'util/castrato'], function(vector, bus) {

	var exports = {},
		entities = {},

		playerUUID,

		latency = 0,

		create = function (freshEntity) {
			if (!freshEntity) return;

			let oldEntity = entities[freshEntity.u];

			entities[freshEntity.u] = freshEntity;
			
			if (oldEntity) {
				entities[freshEntity.u].p.x = (entities[freshEntity.u].p.x + oldEntity.p.x * 3) / 4;
				entities[freshEntity.u].p.y = (entities[freshEntity.u].p.y + oldEntity.p.y * 3) / 4;
			}

			if (freshEntity.u == playerUUID) {
				bus.emit('entities:playerdata', freshEntity);
			}

			freshEntity.latency = latency;

			return entities[freshEntity.u];
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

	bus.on('network:latency', function (data) {
		if (!data) return;
		latency = data;
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
				entity.p.x += entity.v.x * (advanceMs + entity.latency / 2);
				entity.p.y += entity.v.y * (advanceMs + entity.latency / 2);

				entity.latency = 0;

			}

		},
		all: function () {
			return entities;
		}
	}

	return exports;
});