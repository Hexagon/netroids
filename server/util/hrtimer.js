var
	exports = {},
  	timers = {};

exports.start = function (timerName) {
	timers[timerName] = {
		start: process.hrtime(), 
		last: process.hrtime()
	};
	return 0;
};

exports.lap = function (timerName) {
	if (timers[timerName]) {
		let passed = process.hrtime(timers[timerName].last);
		timers[timerName].last = process.hrtime();
		return passed[0] * 1000000 + passed[1] / 1000000
	} else {
		return exports.start(timerName);
	}
};

exports.intermediate = function (timerName) {
	if (timers[timerName]) {
		let passed = process.hrtime(timers[timerName].last);
		return passed[0] * 1000000 + passed[1] / 1000000
	} else {
		return exports.start(timerName);
	}
};

exports.total = function (timerName) {
	if (timers[timerName]) {
		let passed = process.hrtime(timers[timerName].start);
		return passed[0] * 1000000 + passed[1] / 1000000
	} else {
		return exports.start(timerName);
	}
};

module.exports = exports;