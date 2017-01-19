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


		drawBackground = function () {


		},


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
		if(!canvas.place("#game", "backscroll")) {
			console.error("Could not create canvas, bailing out.");
			return;
		}

		context = canvas.getContext();
		canvasElm = canvas.getCanvas();


	};

	exports.redraw = function () {
		drawBackground();
	};

	exports.scroll = function (advanceMs) {
		if ((player = entities.getCurrentPlayer())) {
			if (dimensions) {
				moveBackground(advanceMs, player);
			}
		}
	};

	return exports;

});