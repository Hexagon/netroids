const
  static = require('node-static'),
  port = process.env.PORT || 80,
  path = require('path');

var
  file,
  server,
  io;

// Set up static file location
file = new static.Server(path.join(process.cwd(), 'client'));

// Create http server, handle static assets
server = require('http').createServer(function (req, res) {
    req.addListener('end', function () { file.serve(req,res); } ).resume();
});

// Append socket.io to http server
io = require('socket.io')(server),

// Listen to port env:PORT or 8080
server.listen(port, function(){
  console.log('listening on *:'+port);
});

// Send ping request on set interval
io.sockets.on('connection', function (socket) {

  var timeout,
      player,

      pingInterval;

  socket.pings = 0;
  socket.latency = 0;

  // Handle disconnect
  socket.on('disconnect', function () {
  	clearTimeout(pingInterval);
  });

  // Intervalled ping
  pingInterval = setInterval(function () {
    socket.emit('ping', {t: new Date().getTime(), l: socket.latency});
  }, 2000);

  // Initial ping
  socket.emit('ping', {t: new Date().getTime(), l: socket.latency});

});

module.exports = {
	server,
	io
};