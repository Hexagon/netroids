"use strict";

var 
  restify = require('restify'),
  server = restify.createServer(),
  io = require('socket.io').listen(server.server),
  path = require('path'),
  entities = require('./entities.js'),
  player = require('./player.js'),

  scoreboard =  {},
  playerIterator = 1,
  last,

  sbUpdated = function () {
    var sbs = [];
    for (var entry in scoreboard)
      sbs.push(scoreboard[entry]);
    sbs.sort(function (a,b) { return b.score - a.score; });
    io.emit('scoreboard', {s: sbs });
  },

  iterate = function () {
    var
      passedHrTime = process.hrtime(last || process.hrtime()),
      passed = passedHrTime[0] * 1000000 + passedHrTime[1] / 1000000;

    last = process.hrtime();

    entities.advance(passed, function (entity) {
      // Entity added
      io.emit('entities', entity);
    },function (uuid) {
      // Entity removed
      io.emit('remove', uuid);
    },function (uuid) {
      // Kill
      if(scoreboard[uuid]) scoreboard[uuid].k++;
      sbUpdated();
    },function (uuid) {
      // Death
      if(scoreboard[uuid])scoreboard[uuid].d++;
      sbUpdated();
    },function (uuid, delta) {
      // Score
     if(scoreboard[uuid]) {
        scoreboard[uuid].s+=delta;
        sbUpdated();
      }
    });

    setTimeout(function () { iterate(); }, 25);
  };

// Communicate
io.sockets.on('connection', function (socket) {
  
  var timeout;

  socket.pings = 0;
  socket.latency = 0;

  // Create player
  socket.player = player.create();
  socket.emit('player', socket.player.uuid);

  scoreboard[socket.player.uuid] = {
    n: "Player " + (playerIterator++),
    uuid: socket.player.uuid,
    s: 0,
    k: 0,
    d: 0,
    l: 0
  };

  sbUpdated();

  // Player requested respawn
  socket.on('respawn', function () {
    socket.player = player.create(socket.player.uuid);
    socket.emit('player', socket.player.uuid);
    socket.broadcast.emit('entities', [socket.player]);
    // Update scoreboard
  });

  // Send all entities
  var tmp = entities.all();
  socket.emit('entities', entities.all());

  // Handle disconnect
  socket.on('disconnect', function () {

     // Remove from socket list
     delete scoreboard[socket.player.uuid];
     sbUpdated();

     // Other stuff (this is bridge)
     entities.remove(socket.player.uuid);
     socket.broadcast.emit('remove', socket.player.uuid);

  });

  // Get update of keys
  socket.on('keys', function (data) {
    socket.player.keys = data;
  });

  // Get update of mouse
  socket.on('mouse', function (data) {
    if(data.v) {
      // Onödigt att lägga detta på spelaren?
      socket.player.mouse = data;
    }
  });

  // Handle ping
  socket.on('ping-response', function (pingTime) {
    if(pingTime && pingTime.t) {

      socket.latency = Math.round(((new Date().getTime() - pingTime.t) + socket.latency) / ((socket.pings++) == 0 ? 1 : 2));
      scoreboard[socket.player.uuid].l = socket.latency;
    }
  });

  // Intervalled ping
  setInterval(function () {
    socket.emit('ping', {t: new Date().getTime(), l: socket.latency, st: new Date().getTime()});
  }, 2000);
  // Initial ping
  socket.emit('ping', {t: new Date().getTime(), l: socket.latency});

});

  // Full update of scoreboard each fifth second
  setInterval(function () {
    sbUpdated();
  },5000);

  // Create random debris if needed, each third second
  setInterval(function () {
    if(Object.keys(entities.all()).length < 50) {
      var maxHp = Math.round(Math.random()*75+25),
          mass = Math.round(maxHp/1.5);
      io.emit('entities',[ 
        entities.create({ 
          "i": "Asteroid",
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
            "current": maxHp,
            "max": maxHp
          },
          "r": 0.0,
          "m": mass,
          "t": "asteroid"
        })]
      );
    }
  },1000);

// Serve static files
server.get(/\/?.*/, restify.serveStatic({
    directory: path.join(process.cwd(), 'client'),
    default: 'index.html'
}));

// Start webserver
server.listen(process.env.PORT || 6660, function() {
  console.log('%s listening at %s', server.name, server.url);
});

// Start iteration
iterate();
