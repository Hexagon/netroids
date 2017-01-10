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
				entities[freshEntity.u].p.x = (entities[freshEntity.u].p.x * 2 + oldEntity.p.x) / 3;
				entities[freshEntity.u].p.y = (entities[freshEntity.u].p.y * 2 + oldEntity.p.y) / 3;
			}

			if (freshEntity.u == playerUUID) {
				bus.emit('entities:playerdata', freshEntity);
			}

			freshEntity.latency = latency;
			freshEntity.received = new Date().getTime();

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
				if (entity.latency) {
				
					let recvDelta = recDelta = new Date().getTime() - entity.received;

					entity.p.x += entity.v.x * (recvDelta + entity.latency / 2);
					entity.p.y += entity.v.y * (recvDelta + entity.latency / 2);
					
					entity.latency = 0;

				} else {
					entity.p.x += entity.v.x * advanceMs;
					entity.p.y += entity.v.y * advanceMs;
				
				}

				// Currently only used for animating stuff
				if(entity.ttl) {
					entity.ttl -= advanceMs;
				}
				

			}

		},
		all: function () {
			return entities;
		}
	}

	return exports;
});