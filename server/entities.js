"use strict";

const	
	
	uuid = require('uuid'),
	klon = require('klon');

var 	
	entities = {},
	defaults = {
		"n": "UFO",
		"p": {
			"x": 0,
			"y": 0
		},
		"v": {
			"x": 0,
			"y": 0
		},
		"a": {
			"d": 0,
			"m": 0
		},
		"r": 0,
		"m": 1,
		"hp": {
			"current": 100,
			"max": 100
		},
		"t": "asteroid"
	},
	create = function (parameters) {
		var freshEntity = klon(parameters, parameters.uuid ? entities[parameters.uuid] : klon(defaults,{}) );
		
		// Create uuid if not exists
		if(!freshEntity.uuid) {
			freshEntity.uuid = uuid();
		}
		
		// Append to inventory
		entities[freshEntity.uuid] = freshEntity;
		
		// Return the new entity
		return entities[freshEntity.uuid];
	},
	distance = function (e1, e2) {
		return Math.abs(Math.sqrt(Math.pow((e1.x-e2.x),2) + Math.pow((e1.y-e2.y),2)));
	};

module.exports = {
	create: function (parameters) {
		return create(parameters);

	},
	remove: function (id) {
		delete entities[id];
	},
	get: function (id) {
		return entities[id];
	},
	advance: function (advanceMs, updatedCallback, removedCallback, killCallback, deathCallback, scoreCallback) {

		var entity, entityIdx, innerEntity, innerEntityIdx, updated=[];

		for(entityIdx in entities) {

			entity = entities[entityIdx];
			updated[entityIdx] = false;

			// Dont process non-entities
			if(!entity) continue;

			// Expore certain entities
			if(entity.ttl !== undefined && entity.ttl-- < 0) {
				removedCallback(entities[entityIdx].uuid);
				delete entities[entityIdx];
				continue;
			}

			entity.lc = new Date().getTime();

			// Change stuff?
			if (entity.controls) {

				if(entity.controls.accelerate) {
					entity.a.m = Math.min(1,distance(entity.controls.rotation,{x:0,y:0}))/50;
				} else {
					entity.a.m = 0;
				}

				entity.a.d = -Math.atan2(entity.controls.rotation.x, entity.controls.rotation.y)+Math.PI/2;

				if(entity.controls.reverse) {
					entity.a.d += Math.PI;
				}

				entity.r = entity.a.d;

				updated[entityIdx] = true;
			
				if ( entity.controls.fire && (new Date() - (entity.lastFire || 0)) > 250 ) {
					
					entity.lastFire = new Date();

					// Fire!
					var nVel = {
						x: entity.v.x + Math.cos(entity.a.d)*0.75,
						y: entity.v.y + Math.sin(entity.a.d)*0.75
					};

					var newEntity = create({
						p: entity.p,
						v: nVel,
						t: "ammo",
						m: 5,
						o: entity.uuid,
						hp: {
							current: 5,
							max: 5
						},
						ttl: 75
					});

					updated[newEntity.uuid] = true;

				}

			}

			// Apply acceleration to velocity
			if(entity.a.m) {
				entity.v.x += Math.cos(entity.a.d)*entity.a.m;
				entity.v.y += Math.sin(entity.a.d)*entity.a.m;
			}

			// Apply velocity to position
			entity.p.x += entity.v.x * advanceMs;
			entity.p.y += entity.v.y * advanceMs;

			// Collide
			for(innerEntityIdx in entities) {
				innerEntity = entities[innerEntityIdx];

				// Do not collide with self, do not collide objects of same type
				if (innerEntity === entity || !innerEntity || entity.o == innerEntity.uuid || innerEntity.o == entity.uuid || innerEntity.t == entity.t ) continue;

				// Is colliding?
				if ((entity.m + entity.m) >= distance(entity.p,innerEntity.p) ) {

					entity.hp.current -= innerEntity.hp.max;
					innerEntity.hp.current -= entity.hp.max;

					updated[entityIdx] = true;
					updated[innerEntityIdx] = true;

					if(entity.t == "player" && innerEntity.t == "ammo") {
						scoreCallback(innerEntity.o, 10);
					}

					if(entity.t == "asteroid" && innerEntity.t == "ammo") {
						scoreCallback(innerEntity.o, 5);
					}

				}

				// Is dead?
				if (entity.hp.current <= 0) {
					if(entity.t == "player" && innerEntity.t == "ammo") {
						killCallback(innerEntity.o);
						scoreCallback(innerEntity.o, 100);
					}
					if(entity.t == "player") {
						deathCallback(entity.uuid);
						scoreCallback(innerEntity.o, 25);
					}
					removedCallback(entity.uuid);
					delete entities[entityIdx];
					break;
				}


			}

		}

		var updatedEntities = [];
		for(entityIdx in entities) {
			if(updated[entityIdx]) {
				if(entities[entityIdx]) {
					updatedEntities.push(entities[entityIdx]);
				}
			}
		}
		
		updatedCallback(updatedEntities);

	},
	all: function () {
		return entities;
	}
};

