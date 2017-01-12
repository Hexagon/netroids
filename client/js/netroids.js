require.config({
	baseUrl: 'js/modules',
	paths: {
		"io": "http://netroids.56k.guru/socket.io/socket.io.js"
	}
});

define(['viewport', 'backdrop', 'backscroll', 'minimap', 'entities', 'network', 'textures', 'dom', 'util/castrato'], function(viewport, backdrop, backscroll, minimap, entities, network, textures, dom, bus) {

	var
		lastRedraw,
		main;

	// Set up main loop, but don't start it yet
	main = function () {

		requestAnimationFrame(main);
		
		var now = window.performance.now(),
			passed = lastRedraw ? now - lastRedraw : 0;
			lastRedraw = now;

		entities.advance(passed);
		
		backscroll.scroll(passed);

		viewport.redraw();
		minimap.redraw();

	};

	// Show loading screen
	dom.show("loading");
	dom.focus("nick");

	// Load textures
	dom.clearLoadStatus();
	dom.addLoadStatus("Loading static assetts ...");
    textures.load([
		["background","assets/gfx/space.jpg"],
		["seamlessSpace","assets/gfx/seamless-space.png"],
		["asteroid1","assets/gfx/asteroid.png"],
		["ship","assets/gfx/spaceship.png"],
		["flame","assets/gfx/jet-flame.png"],
		["explosion","assets/gfx/explosion.png"],
		["ringicons","assets/gfx/qubodup_ringicons.png"]

	// Textures successfully loaded
	], function () {
    	
    	// Textures ok, go on

		// ... and creating viewports
		dom.addLoadStatus('Creating backdrop ...');
		backdrop.create();
		backdrop.redraw();

		dom.addLoadStatus('Creating backscroll ...');
		backscroll.create();
		backscroll.redraw();

		dom.addLoadStatus('Creating viewport ...');
		viewport.create();

		dom.addLoadStatus('Creating minimap ...');
		minimap.create();

		// ... and starting main loop
		dom.addLoadStatus('Done!');

		// Ready to fly!
		setTimeout(function () {
			network.connect();
			dom.hideElement('status');
			dom.showElement('ready');
		}, 750);

		// Connect join button
		var connect = function () {

			if (dom.value('nick').length > 0) {

	    		dom.addLoadStatus('Connecting to ' + window.location.host + ' ...');

				// Always send nick on network connect (/reconnect)
				if (dom.value('nick').length > 0) {
					bus.emit('player:nick', dom.value('nick'));
				}
				
				dom.show("game");
				main();

			}

		};

		dom.on('join', 'click', connect);
		dom.on('nick', 'keydown', function (e) {
			if(e.code == "Enter") {
				connect();
			}
		});

		// Always re-send nick on network connect
		bus.on('network:connect', function () {
			if (dom.value('nick').length > 0) {
				bus.emit('player:nick', dom.value('nick'));
			}
		})

	// Texture load progress update
    }, function (current, total) {
    	dom.addLoadStatus('Textures (' + current + '/' + total + ') ...');

    // Texture load failure
    }, function (err) {
    	dom.addLoadStatus('Failed loading textures: ' + err,"error");
    });

});