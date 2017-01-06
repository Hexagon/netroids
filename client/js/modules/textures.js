define(function() {

	var 
		// Inventory
		inventory = {},

		// To keep track of progress
		total,
		left,

		// Callback functions
		done,
		progress,
		error,

		// Functions to be exported is placed here
		exports = {},

		// Internal functions
		onTimeout = function (texture) {
			error && error('Load of texture "' + texture[1] + '" timed out.');
		},
		onLoad = function (texture, img) {
			left--;
			inventory[texture[0]] = img;
			progress && progress(total-left, total);
			if(left <= 0) done && done();
		},
		load = (texture) => {

			let img = new Image(),
				timeout = setTimeout(function () {
					onTimeout(texture);
					timeout = false;
				},15000);

			img.onload = function () {
				if(timeout) {
					clearTimeout(timeout);
					onLoad(texture, img);	
				}
			};

			img.src = texture[1];
		};

	// Exports
	exports.load = (textures, _done, _progress, _error) => {

		// Connect callback functions
		done = _done;
		progress = _progress;
		error = _error;

		// Keep track of number of textures
		left = total = textures.length;

		// Load each texture using the "load" function
		textures.forEach( (texture) => load(texture) );

	};

	exports.get = (id) => { return inventory[id] };

	// Yay, return our exported functions
	return exports;
});