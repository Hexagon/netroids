define(['util/castrato', 'dom/canvas', 'entities', 'util/vector', 'textures'], function(bus, canvasFactory, entities, vector, textures) {

	var 

		exports = {},

		dimensions,

		center = {
			x: 500,
			y: 500
		},

		screenCenter = {
			x: 500,
			y: 500
		},

		position = {
			x: 0,
			y: 0
		},

		canvas,
		canvasElm,
		context,

		patterns = {},

		createPattern = function (id, ctx) {
			patterns[id] = ctx.createPattern(textures.get(id), "repeat");
		},

		drawBackground = function () {

			context.save(); 
			context.rect(0,0, dimensions.width, dimensions.height);
			context.fillStyle=patterns.seamlessSpace;
			context.fill(); 
			context.restore();

		},

		moveBackground = function (advanceMs, player, dimensions) {
			
			position.x += player.v.x * advanceMs;
			position.y += player.v.y * advanceMs;

			if(position.x < 0) position.x += 20480;
			if(position.y < 0) position.y += 20480;

			let dX = position.x*0.66 % 1024,
				dY = position.y*0.66 % 1024;

			canvasElm.style.transform = "translate3d("+(-dX)+"px, "+(-dY)+"px, 0px)";
		};

	exports.create = function () {

		// Create new canvas
		canvas = canvasFactory();


		// Canvas was resized
		canvas.on("resize", function (_dimensions) {
			context = canvas.getContext();
			dimensions = _dimensions;
			drawBackground();
		});


		// Place canvas in DOM
		if(!canvas.place("#game", "backscroll", undefined, undefined, 1024, 1024)) {
			console.error("Could not create canvas, bailing out.");
			return;
		}

		context = canvas.getContext();
		canvasElm = canvas.getCanvas();

		// Load textures
		createPattern("seamlessSpace", canvas.getContext());

	};

	exports.redraw = function () {
		drawBackground();
	};

	exports.scroll = function (advanceMs) {
		if ((player = entities.getCurrentPlayer())) {
			moveBackground(advanceMs, player, dimensions);
		}
	};

	return exports;

});