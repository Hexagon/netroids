"use strict";

var 
  server = require('./server.js'),
  
  entities = require('./entities'),
  Player = require('./entities/player.js'),
  Asteroid = require('./entities/asteroid.js'),

  scoreboard = require('./scoreboard.js'),

  iterate = function () {

    entities.advance(function (entity) {

      // Entity added
      server.io.emit('entities', entity);

    },function (uuid) {
      
      server.io.emit('remove', uuid);
        

    },function (uuid) {

      scoreboard.kill(uuid);

    },function (player) {

      scoreboard.death(player.uuid);

      // Respawn player
      player.respawn();
      server.io.emit('entities', [player]);
      console.log('Respawned');
      
    },function (uuid, delta) {

      scoreboard.score(uuid, delta);

    });

    setTimeout(iterate, 25);

  };

// Communicate
server.io.sockets.on('connection', function (socket) {

  // Create player
  var player = new Player();

  // Emit player, could this be handled by inventory?
  socket.emit('player', player.uuid);

  // Add player to entity inventory
  entities.add(player);

  // Add player to scorebard
  scoreboard.add(player);

  // Send all entities to the new player
  var tmp = entities.all();
  socket.emit('entities', entities.all());

  // Get update of mouse
  socket.on('controls', function (data) {
    if(data && player) {
      player.local.controls = data;
    }
  });

  // Handle ping response (request is sent by server.js)
  socket.on('ping-response', function (pingTime) {
    if(pingTime && pingTime.t) {
      socket.latency = Math.round(((new Date().getTime() - pingTime.t) + socket.latency) / ((socket.pings++) == 0 ? 1 : 2));
      scoreboard.latency(player.uuid, socket.latency);
    }
  });

  // Handle disconnect
  socket.on('disconnect', function () {

     // Remove from socket list
     scoreboard.remove(player.uuid);

     // Other stuff (this is bridge)
     entities.remove(player);
     server.io.emit('remove', player.uuid);

  });

});

// Create random debris if needed, each third second
setInterval(function () {
  if(Object.keys(entities.all()).length < 50) {

    var maxHp = Math.round(Math.random()*75+25),
        mass = Math.round(maxHp/1.5),
        newAsteroid = new Asteroid();

    newAsteroid.position.set(Math.random()*30000-15000,Math.random()*30000-15000);
    newAsteroid.velocity.set(Math.random()*0.0005-0.001,Math.random()*0.0005-0.001);

    entities.add(newAsteroid);

    server.io.emit('entities',[ 
        newAsteroid
    ]);

  }
},1000);

// Start iteration
iterate();

// Create random powerups
/*setInterval(function () {
  // If we got less than 70 entities on gamefield
  if(Object.keys(entities.all()).length < 70) {
    powerups.request(1.0, function (powerup) {
      if(powerup) {
        server.io.emit('entities',[ 
          entities.create({ 
            "i": "Powerup",
            "p": {
              "x": Math.random()*30000-15000,
              "y": Math.random()*30000-15000
            },
            "v": {
              "x": Math.random()*0.0005-0.001,
              "y": Math.random()*0.0005-0.001
            },
            "a": {
              "d": 0.0,
              "m": 0.0
            },
            "hp": {
              "current": 1,
              "max": 1
            },
            "r": 0.0,
            "m": 10,
            "t": powerup.type,
            "ts": powerup.subtype,
            "tc": powerup.class
          })]
        );
      }
    });
  }
},1000);*/
