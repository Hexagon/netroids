"use strict";

const PowerUp = require('./powerup.js'),
	  hrtimer = require('../util/hrtimer.js');

var 	
	all = {},
	byType = {},
	
	add = function (entity) {
		all[entity.uuid] = entity;
		if(!byType[entity.type]) byType[entity.type] = {};
		byType[entity.type][entity.uuid] = entity;
	},

	remove = function (entity) {
		
		// Check if this death dropped something
		if( entity.type == "asteroid" ) {
			let powerup = new PowerUp(entity);
			if(powerup.public.dropped) {
				add(powerup);
			}
		}

		// Delete entity
		delete all[entity.uuid];
		delete byType[entity.type][entity.uuid];
	},

	advance = function (updatedCallback, removedCallback, killCallback, deathCallback, scoreCallback) {

		var entity,
			entityIdx,
			innerEntity,
			innerEntityIdx,
			updated=[],
			advanceMs = hrtimer.lap('entityAdvance');

		// Loop through all entities
		for(entityIdx in all) {	entity = all[entityIdx];

			// Dont process non-entities
			if(!entity) continue;

			// Expire certain entities
			if(entity.hasExpired()) {
				removedCallback(all[entityIdx].uuid);
				remove(entity);
				continue;
			}

			// Advance!
			entity.advance(advanceMs);

			// Detect collisions
			let typeIdx, type;
			for(typeIdx in entity.collides) {
				type = entity.collides[typeIdx];
				entity.collide(type, byType[type]);
			}

		}

		// Is something dead? Notify listeners!
		// Also store what has changed in a new array
		// THIS EXTRA LOOP IS ONLY TO CATCH _NEW_ ITEMS, find away around this
		for(entityIdx in all) {
			entity = all[entityIdx];

			// Is the entity updated?
			if(entity && entity.local.updated) {

				// Is the entity dead?
				if ((entity.public.hp && entity.public.hp.current <= 0) || entity.pendingRemoval) {

					// Did this generate score?
					if (entity.local.score) {
						scoreCallback(entity.public.owner, entity.local.score);
					}

					// Was this death a player?
					if (entity.type == "player") {

						// Was this a kill?
						if (entity.local.killer) {
							killCallback(entity.local.killer);
						}

						// Notify that a death has occurred, but NEVER remove players untin disconnect
						deathCallback(entity);

					} else {

						// Do the removal, after notifying callee
						removedCallback(entity.uuid);
						remove(entity);

					}

				// ... nope, just updated. Notify the client
				} else {
					updated.push(entity);
				}
				
				entity.local.updated = false;
			}

			//updated.push(entity);
		}

		// Notify listeners that stuff has changed!
		if(updated.length > 0) updatedCallback(updated);

	};

module.exports = {
	add: function (entity) {
		add(entity);
	},
	remove: function (entity) {
		remove(entity);
	},
	get: function (id) {
		return all[id];
	},
	advance: function (/*advanceMs, updatedCallback, removedCallback, killCallback, deathCallback, scoreCallback*/) {
		advance(...arguments);
	},
	all: function () {
		return all;
	},
	byType: function (type) {
		return byType[type];
	}
};

