var 
	scoreboard =  {},
	exports = {};

const 
	server = require('./server.js');

// Utility function that sorts scoreboard, and notify all players, when something has changed
function updated () {

	// Convert scoreboard to array
	var scoreboardArr = [];
	for (var entry in scoreboard) scoreboardArr.push(scoreboard[entry]);

	// Sort scoreboard by score, descending
	scoreboardArr.sort(function (a,b) { return b.score - a.score; });

	server.io.emit('scoreboard', {s: scoreboardArr });

}

// Full update of scoreboard each fifth second
setInterval(updated, 5000);

// Export a couple of functions, which control the content of the scoreboard
module.exports = {
	add: function (player) {

		scoreboard[player.uuid] = {
			n: player.nick ? player.nick.substring(0, 15) : "[in lobby]",
			uuid: player.uuid,
			s: 0,
			k: 0,
			d: 0,
			l: 0
		};

		updated();
	},
	setNick: function (uuid, nick) {
		scoreboard[uuid].n = nick ? nick.substring(0, 15) : "[in lobby]";

		updated();
	},
	remove: function (uuid) {
		if (!scoreboard[uuid]) return;

		delete scoreboard[uuid];

		updated();
	},
	kill: function (uuid) {
        if (!scoreboard[uuid]) return;

        scoreboard[uuid].k++;

        updated();	
	},
	death: function (uuid) {
		if (!scoreboard[uuid]) return;

		scoreboard[uuid].d++;

		updated();
	},
	score: function (uuid, delta) {
		if (!scoreboard[uuid]) return;

		scoreboard[uuid].s += delta;
		updated();
	},
	latency: function (uuid, latency) {
		if (!scoreboard[uuid]) return;

		scoreboard[uuid].l = latency;

		updated();
	}
}