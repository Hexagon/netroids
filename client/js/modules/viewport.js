define(['util/castrato', 'dom/canvas', 'entities', 'util/vector', 'textures'], function(bus, canvasFactory, entities, vector, textures) {

	var 

		exports = {},

		dimensions,

		debug = {
			velocity: false,
			acceleration: false,
			rotation: false
		},

		center = {
			x: 500,
			y: 500
		},

		screenCenter = {
			x: 500,
			y: 500
		},

		canvas,
		context,

		controlCircleRadius = 100,

		patterns = {},

		createPattern = function (id, ctx) {
			patterns[id] = ctx.createPattern(textures.get(id), "repeat");
		},

		drawPointer = function (entity, player, ctx) {

			var vDistance = vector.distance(entity[0].p, player.p);

			if(Math.abs(vDistance) > controlCircleRadius) {

				var vNormal = vector.normal(entity[0].p, player.p),
					vNormalNear = vector.mul(vNormal, controlCircleRadius),
					vNormalFar = vector.mul(vNormal, controlCircleRadius + controlCircleRadius/vDistance*500),
					vNormalFarDistance = vector.distance(vNormalFar);

				if(vNormalFarDistance <= vDistance) {

					// Common
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(player.p.x+center.x+vNormalNear.x,player.p.y+center.y+vNormalNear.y);
					ctx.lineTo(player.p.x+center.x+vNormalFar.x,player.p.y+center.y+vNormalFar.y);

					if(entity[0].t == "player")
						ctx.strokeStyle="#FF4444";
					else
						ctx.strokeStyle="#7777AA";	

					ctx.stroke();
					ctx.restore();
					
				}
			}

		},

		drawControlCircle = function (ctx) {
			ctx.save();
			ctx.beginPath();
			ctx.translate(screenCenter.x,screenCenter.y);
			ctx.arc(0,0,controlCircleRadius,0,2*Math.PI);
			ctx.strokeStyle = "rgba(196,196,255,0.3)";
			ctx.stroke();
			ctx.restore();
		},

		drawEntity = function (entity, center, ctx) {

			var stroke,
				fill;

			// Common
			ctx.beginPath();
			ctx.save();
			ctx.translate(Math.round(entity.p.x+center.x),Math.round(entity.p.y+center.y));
			ctx.rotate(-Math.PI/2+entity.a.d);

			// Draw player
			if(entity.t=="player") {

				ctx.save();
				ctx.rotate(180*Math.PI/180);
				ctx.drawImage(textures.get("ship"),Math.round(-entity.m/1.5),Math.round(-entity.m),Math.round(entity.m*2/1.5),Math.round(entity.m*2));
				ctx.restore();

				if(entity.a.m) {

					ctx.save();
					ctx.globalAlpha=0.8;
					ctx.drawImage(textures.get("flame"),Math.round(-entity.m/3),Math.round(-entity.m-(entity.m*20*entity.a.m)),Math.round(entity.m*2/3),Math.round((entity.m*20*entity.a.m)));
					ctx.restore();

				}

			// Ammo
			} else if (entity.t == "ammo") {
				fill = "red";
				ctx.rect(-entity.m/2,-entity.m/2,entity.m,entity.m);

			// Fallback for other entities
			} else {
				fill = "gray";
				ctx.drawImage(textures.get("asteroid1"),-entity.m,-entity.m,entity.m*2,entity.m*2);

			}

			// Filled entity
			if (fill) {
				ctx.fillStyle=fill;
				ctx.fill();

			}

			// Stroked entity
			if (stroke) {
				ctx.strokeStyle=stroke;
				ctx.stroke();	

			}
			
			// Common
			ctx.restore();

			// Stuff that appliy to everything except ammo
			if (entity.t !== "ammo") {

				// Draw hp
				ctx.save();

				ctx.strokeStyle="#444444";
				ctx.beginPath();
				ctx.translate(entity.p.x+center.x-entity.m-5,entity.p.y+center.y-entity.m-7);
				ctx.moveTo(0,0);
				ctx.lineTo(entity.m*2+10,0);
				ctx.lineWidth = 2;
				ctx.stroke();

				ctx.strokeStyle="green";
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo((entity.m*2+10)*(entity.hp.current/entity.hp.max),0);
				ctx.lineWidth = 5;
				ctx.stroke();

				ctx.restore();

			}

		},

		drawBackground = function (ctx, dimensions) {

			ctx.save();
			ctx.globalAlpha = 0.2;
			ctx.drawImage(textures.get("background"),0,0);

			ctx.rect(0,0,dimensions.width,dimensions.height);
			ctx.fillStyle=patterns.seamlessSpace;
			ctx.translate(Math.round(-player.p.x/2), Math.round(-player.p.y/2));
			ctx.globalCompositeOperation = "lighter";
			ctx.fill();
			ctx.restore();

		};

	exports.create = function () {

		// Create new canvas
		canvas = canvasFactory();

		// Canvas was resized
		canvas.on("resize", function (_dimensions) {
			console.log("Canvas resized");
			dimensions = _dimensions;
			controlCircleRadius = Math.min(dimensions.height, dimensions.width)/2.5;
			screenCenter = {
				x: dimensions.width / 2,
				y: dimensions.height / 2
			};
		});

		// Place canvas in DOM
		if(!canvas.place("#game", "c")) {
			console.error("Could not create canvas, bailing out.");
			return;
		}

		context = canvas.getContext();

		// Load textures
		createPattern("seamlessSpace", canvas.getContext());

		// Translate mouse position to acceleration vector
		bus.on("mouse:state", function (data) {
			var accelPosition = vector.sub(data.position, screenCenter),
				accelVectorNormal = vector.div(accelPosition, controlCircleRadius);
			bus.emit('mouse:vector', { b: data.buttons, v: accelVectorNormal });
		});

	};

	exports.redraw = function (advanceMs) {
		if ((player = entities.getCurrentPlayer())) {

			// Clear canvas
			context.fillStyle = "black";
			context.fillRect(0, 0, dimensions.width, dimensions.height);
			drawBackground(context, dimensions);

			// Find center of screen
			center = vector.sub(screenCenter, player.p);

			drawControlCircle(context);

			// Draw entities
			var ents = entities.all(),
				closest = [],
				currentDistance;
			for(id in ents) {
				drawEntity(ents[id], center, context);

				// While we're here, find the 10 closest non-ammo objects to player
				if(ents[id].t !== "ammo") {
					currentDistance = vector.distance(ents[id].p,player.p);
					closest.push([ents[id],currentDistance])
				}
			}

			// Sort by distance ascending and limit to the first 10
			closest = closest.sort(function(a,b) { return a[1]-b[1]; });
			closest = closest.slice(0,10);

			// Draw pointers to closest entities
			for(id in closest) {
				drawPointer(closest[id], player, context);
			}
		}
	}
	return exports;

});