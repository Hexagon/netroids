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
					else if(entity[0].t == "powerup")
						ctx.strokeStyle="#AAAA77";
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

			// Ignore if entity is out of bounds
			if (!(entity.p.x+center.x>-100 && entity.p.x+center.x < dimensions.width + 100 && entity.p.y+center.y > -100 && entity.p.y+center.y < dimensions.height + 100)) return;

			var stroke,
				fill;

			// Common
			ctx.beginPath();
			ctx.save();
			ctx.translate(entity.p.x+center.x,entity.p.y+center.y);
			ctx.rotate(-Math.PI/2+entity.r.d);

			// Draw player
			if(entity.t=="player") {

				ctx.save();
				ctx.rotate(180*Math.PI/180);
				ctx.drawImage(textures.get("ship"),-entity.m/1.5,-entity.m,entity.m*2/1.5,entity.m*2);
				ctx.restore();

				// Draw flame
				if(entity.a.m) {
					ctx.save();
					ctx.globalAlpha=0.8;
					ctx.drawImage(textures.get("flame"),-entity.m/3,-entity.m-(entity.m*20*entity.a.m)*3,entity.m*2/3,(entity.m*20*entity.a.m)*3);
					ctx.restore();

				}

			// Ammo
			} else if (entity.t == "bullet") {
				if(entity.pu.damage > 10) {
					fill = "orange";	
				} else {
					fill = "yellow";	
				}
				
				ctx.rect(-entity.m/2,-entity.m/2,entity.m,entity.m);

			// Explosion
			} else if(entity.t=="explosion") {
				let spriteIdx = Math.round((entity.pu.ttlmax-entity.ttl)/(entity.pu.ttlmax/10));
				ctx.drawImage(textures.get("explosion"),spriteIdx*128,0,128,128,-entity.m*4,-entity.m*4,entity.m*8,entity.m*8);
				//ctx.drawImage(textures.get("ship"),-entity.m/1.5,-entity.m,entity.m*2/1.5,entity.m*2);

			// Fallback for other entities
			} else if (entity.t == "powerup") {

				if(entity.pu.dropped) {
					if (entity.pu.dropped.subtype == "rapid") {
						ctx.drawImage(textures.get("ringicons"),256,0,128,128,-entity.m*2,-entity.m*2,entity.m*4,entity.m*4);		
					} else if (entity.pu.dropped.subtype == "spread") {
						ctx.drawImage(textures.get("ringicons"),128,128,128,128,-entity.m*2,-entity.m*2,entity.m*4,entity.m*4);		
					} else if (entity.pu.dropped.subtype == "damage") {
						ctx.drawImage(textures.get("ringicons"),128,0,128,128,-entity.m*2,-entity.m*2,entity.m*4,entity.m*4);		
					}
				}
				

			} else {

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
			if (entity.pu.hp) {

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
				ctx.lineTo((entity.m*2+10)*(entity.pu.hp.current/entity.pu.hp.max),0);
				ctx.lineWidth = 5;
				ctx.stroke();

				ctx.restore();

				// Draw shield
				if (entity.pu.shield) {

					ctx.save();

					ctx.strokeStyle="#444444";
					ctx.beginPath();
					ctx.translate(entity.p.x+center.x-entity.m-5,entity.p.y+center.y-entity.m-14);
					ctx.moveTo(0,0);
					ctx.lineTo(entity.m*2+10,0);
					ctx.lineWidth = 2;
					ctx.stroke();

					ctx.strokeStyle="#3344FF";
					ctx.beginPath();
					ctx.moveTo(0,0);
					ctx.lineTo((entity.m*2+10)*(entity.pu.shield.current/entity.pu.shield.max),0);
					ctx.lineWidth = 5;
					ctx.stroke();

					ctx.restore();

				}

			}

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
		if(!canvas.place("#game", "viewport")) {
			console.error("Could not create canvas, bailing out.");
			return;
		}

		context = canvas.getContext();

		// Load textures
		createPattern("seamlessSpace", canvas.getContext());

		// Translate mouse position to acceleration vector
		bus.on("pointer:position", function (data) {
			var accelPosition = vector.sub(data, screenCenter),
				accelVectorNormal = vector.div(accelPosition, controlCircleRadius);
			bus.emit('pointer:vector', accelVectorNormal );
		});

	};

	exports.redraw = function (advanceMs) {

		if ((player = entities.getCurrentPlayer())) {

			// Clear canvas
			context.clearRect(0, 0, dimensions.width, dimensions.height);

			// Find center of screen
			center = vector.sub(screenCenter, player.p);

			// Draw entities
			var ents = entities.all(),
				closest = [],
				currentDistance;
			for(var id in ents) {
				drawEntity(ents[id], center, context);

				// While we're here, find the 10 closest non-ammo objects to player
				if(ents[id].t !== "bullet") {
					currentDistance = vector.distance(ents[id].p,player.p);
					closest.push([ents[id],currentDistance])
				}
			}

			drawControlCircle(context);

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