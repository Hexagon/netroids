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
		},

		clear = function () {
			playerUUID = undefined;
			entities = {};
		};

	bus.on('network:disconnect', function (data) {
		clear();
	});

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

				let entity = entities[entityIdx],
					ladvanceMs = advanceMs;

				// This entity is just received, try to compensate for latency and stuff
				if (entity.received) {
					ladvanceMs = (new Date().getTime() - entity.received) + (entity.latency / 2);

					// Reset latency and msBuffer
					entity.received = 0;
				}
			
				// Increment in steps of 17 ms, until there is less than 17 ms left
				while(ladvanceMs > 0) {
					let msLeft = Math.min(ladvanceMs,17);
					if(msLeft >= 7) {
						entity.v.x += entity.a.x;
						entity.v.y += entity.a.y;
					}
					entity.p.x += entity.v.x * msLeft;
					entity.p.y += entity.v.y * msLeft;
					ladvanceMs -= msLeft;
				}


				// Currently only used for animating stuff
				if(entity.ttl) {
					entity.ttl -= advanceMs;
				}
				
			}

		},
		all: function () {
			return entities;
		},
		clear: function () {
			clear();
		}
	}

	return exports;
});