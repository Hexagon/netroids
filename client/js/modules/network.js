define(['io', 'util/castrato'], function (io, bus) {

	var 
		exports = {},

		socket,

		playerUUID; // ToDo: Emit separate event on death, to avoid this. Maybe handle death on server altogether?

	exports.connect = function (url) {

		socket = io.connect(url);

		// In
		socket.on('connect', 		() 		=> bus.emit('network:connect')			);
		socket.on('disconnect', 	() 		=> bus.emit('network:disconnect')		);
		socket.on('error', 			(e) 	=> bus.emit('network:error', e)			);
		socket.on('entities', 		(data) 	=> bus.emit('network:entities', data)	);
		socket.on('remove', 		(data) 	=> bus.emit('network:remove', data)		);
		socket.on('player', 		(uuid)  => bus.emit('network:player', uuid)		);
		socket.on('scoreboard', 	(data) 	=> {
			bus.emit("network:scoreboard", {
				scoreboard: data.s,
				playerUUID: playerUUID
			});
		});
		socket.on('player', 		(uuid) => playerUUID = uuid 					);
		socket.on('ping', (data) => {
			if (data && data.t) {
				socket.emit('ping-response', data);
				bus.emit("network:latency", data.l);
				latency = data.l;
			}
		});

		// Out
		//bus.on("keys:change", (keys) => socket.emit("keys", keys) );
		//bus.on('mouse:vector', (data) => socket.emit("mouse", data) );
		bus.on("controls:state", (data) => socket.emit("controls", data) );

	};
	
	return exports;
});