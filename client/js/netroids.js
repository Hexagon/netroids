require.config({
	baseUrl: 'js/modules',
	paths: {
		"io": "http://netroids.56k.guru/socket.io/socket.io.js"
	}
});

define(['viewport', 'minimap', 'entities', 'network', 'textures', 'dom'], function(viewport, minimap, entities, network, textures, dom) {

	var
		lastRedraw,
		main;

	// Set up main loop, but don't start it yet
	main = function () {

		var now = window.performance.now(),
			passed = lastRedraw ? now - lastRedraw : 0;
			lastRedraw = now;

		entities.advance(passed);

		viewport.redraw();
		minimap.redraw();

		requestAnimationFrame(main);
	};

	// Show loading screen
	dom.show("loading");

	// Load textures
	dom.clearLoadStatus();
	dom.addLoadStatus("Loading static assetts ...");
    textures.load([
		["background","assets/gfx/space.jpg"],
		["seamlessSpace","assets/gfx/seamless-space.png"],
		["asteroid1","assets/gfx/asteroid.png"],
		["ship","assets/gfx/spaceship.png"],
		["flame","assets/gfx/jet-flame.png"]

	// Textures successfully loaded
	], function () {
    	
    	// Textures ok, go on connecting
    	dom.addLoadStatus('Connecting to ' + window.location.host + ' ...');
		network.connect();

		// ... and creating viewports
		dom.addLoadStatus('Creating viewport ...');
		viewport.create();
		dom.addLoadStatus('Creating minimap ...');
		minimap.create();

		// ... and starting main loop
		dom.addLoadStatus('Done!');

		// Show gamescreen after a delay of 500ms
		setTimeout(function () {
			dom.show("game");
			main();	
		}, 500);

	// Texture load progress update
    }, function (current, total) {
    	dom.addLoadStatus('Textures (' + current + '/' + total + ') ...');

    // Texture load failure
    }, function (err) {
    	dom.addLoadStatus('Failed loading textures: ' + err,"error");
    });

});