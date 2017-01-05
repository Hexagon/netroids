define(function () {
	var exports = {
		sub: function (e1, e2) {
			return {
				x: e1.x - e2.x,
				y: e1.y - e2.y
			};
		},
		mul: function (e1, e2) {
			return {
				x: e1.x * (e2.x ? e2.x : e2),
				y: e1.y * (e2.y ? e2.y : e2)
			}
		},
		div: function (e1, e2) {
			return {
				x: e1.x / (e2.x ? e2.x : e2),
				y: e1.y / (e2.y ? e2.y : e2)
			}
		},
		length: function (e1, e2, both) {
			let delta = e2 ? exports.sub(e1, e2) : e1,
				pow = exports.mul(delta, delta);
			if (both) {
				return [delta, Math.sqrt(pow.x + pow.y)];
			} else {
				return Math.sqrt(pow.x + pow.y);
			}		
		},
		normal: function (e1, e2) {
			var result = exports.length(e1, e2, true),
				delta = result[0],
				length = result[1];

			return {
				x: delta.x / length,
				y: delta.y / length
			};

		},
		distance: function (e1, e2) {
			return Math.abs(exports.length(e1, e2));
		}
	};
	return exports;
});