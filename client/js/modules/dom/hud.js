define(['util/castrato'], function(bus) {

	var 

		elements = {
			connection: 	document.getElementById('connection'),
			players: 		document.getElementById('players'),
			asteroids: 		document.getElementById('asteroids'),
			latency: 		document.getElementById('latency'),
			scoreboard: 	document.getElementById('scoreboard'),

			/* Resources */
			electricity: 	document.getElementById('resource-electricity'),
			matter: 		document.getElementById('resource-matter'),

			/* Powerups */
			rapid: 			document.getElementById('powerup-rapid'),
			spread: 		document.getElementById('powerup-spread'),
			damage:  		document.getElementById('powerup-damage')
		},

		connection = function (status, rating) {
			elements.connection.innerHTML = status;
			elements.connection.className = rating + " value";	
		},

		entitiesChanged = function (status) {
			elements.players.innerHTML = status.players;
			elements.asteroids.innerHTML = status.asteroids;
		},

		playerChanged = function (player) {

			elements.electricity.innerHTML = player.private.resources.electricity;
			elements.matter.innerHTML = player.private.resources.matter;


			for (id of ['rapid', 'spread', 'damage']) {
				elements[id].className = elements[id].className.replace(' disabled','').replace(' enabled','').replace(' engaged', '');
				if (player.private.powerups[id] && player.private.powerups[id].engaged) {
					elements[id].className = elements[id].className + ' engaged';
				} else if (player.private.powerups[id] && player.private.powerups[id].has) {
					elements[id].className = elements[id].className + ' enabled';
				} else {
					elements[id].className = elements[id].className + ' disabled';
				}
			}
			
		},

		latencyChanged = function (latency) {
			elements.latency.innerHTML = latency + "ms";
			if(latency <= 30) {
				elements.latency.className = "good value";	
			} else if ( latency >= 80) {
				elements.latency.className = "bad value";	
			} else {
				elements.latency.className = "value";	
			}
		},

		scoreboardChanged = function (data) {
			let innerHTML = '';
			data.scoreboard.forEach(function (row) {
				innerHTML += '<tr><td class="' + (row.uuid == data.playerUUID ? 'good' : '') + '">' + row.n + '</td><td>' + row.s + '</td><td>' + row.k + '</td><td>' + row.d + '</td><td>' + row.l	 + '</td></tr>';
			});
			document.getElementById('scoreboard').innerHTML = innerHTML;
		};

	bus.on('network:connect', 		function () { connection("up", "good"); });
	bus.on('network:disconnect', 	function () { connection("down", "bad"); });
	bus.on('network:error', 		function () { connection("error", "bad"); });
	bus.on('network:latency', 		latencyChanged);
	bus.on('network:scoreboard', 	scoreboardChanged);
	bus.on('entities:playerdata', 		playerChanged);

});