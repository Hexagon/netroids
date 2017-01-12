define(['util/castrato', 'dom/canvas', 'entities', 'util/vector'], function(bus, canvasFactory, entities, vector) {

	var

		exports = {},

		canvas,
		context,

		dimensions = { width: 300, height: 200 },

		center = {
			x: 500,
			y: 500
		},

		minimapScaleFactor = 100,

		screenCenter = {
			x: dimensions.width/2,
			y: dimensions.height/2
		},

		drawEntity = function (entity, ctx) {
			if(entity.t === "bullet") return;
			
			ctx.save();
			ctx.translate(Math.round(entity.p.x/minimapScaleFactor+center.x),Math.round(entity.p.y/minimapScaleFactor+center.y));
			if (entity.t == "player") {
				ctx.fillStyle="red";	
			} else if (entity.t == "asteroid") {
				ctx.fillStyle = "white";
			} else {
				ctx.fillStyle = "gray";
			}

			ctx.fillRect(-1,-1,2,2);
 			ctx.restore();
				
		};

	exports.create = function () {

		// Create new canvas
		canvas = canvasFactory();

		// Place canvas in dom
		if(!canvas.place("#minimap", "cm", 300, 200)) {
			console.error("Could not create canvas, bailing out.");
		}

		context = canvas.getContext();

	};

	exports.redraw = function () {
		if ((player = entities.getCurrentPlayer())) {

			// Clear canvas
			context.fillStyle = "black";
			context.fillRect(0, 0, dimensions.width, dimensions.height);

			// Find center of screen
			center = vector.sub(screenCenter, vector.div(player.p,minimapScaleFactor));

			// Draw entities
			context.strokeStyle="gray";
			var ents = entities.all(),
				closest = [],
				currentDistance;
			for(id in ents) {
				drawEntity(ents[id], context);
			}

		}
	};

	return exports;


});