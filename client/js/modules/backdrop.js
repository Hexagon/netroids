define(['util/castrato', 'dom/canvas', 'entities', 'util/vector', 'textures'], function(bus, canvasFactory, entities, vector, textures) {

	var 

		exports = {},

		dimensions,

		canvas,
		context,

		drawBackground = function () {

			context.globalAlpha = 0.2;
			context.drawImage(textures.get("background"),0,0);
			
		};

	exports.create = function () {

		// Create new canvas
		canvas = canvasFactory();

		// Place canvas in DOM
		if(!canvas.place("#game", "backdrop")) {
			console.error("Could not create canvas, bailing out.");
			return;
		}
		
		context = canvas.getContext();

		// Canvas was resized
		canvas.on("resize", function (_dimensions) {
			dimensions = _dimensions;
			exports.redraw(context, dimensions);
		});

	};

	exports.redraw = function () {
		drawBackground();
	}

	return exports;

});