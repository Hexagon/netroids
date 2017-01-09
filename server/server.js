const

  restify 	= require('restify'),
  http 		= restify.createServer(),
  io 		= require('socket.io').listen(http.server),
  path 		= require('path');

// Serve static files
http.get(/\/?.*/, restify.serveStatic({
    directory: path.join(process.cwd(), 'client'),
    default: 'index.html'
}));

// Start webserver
http.listen(process.env.PORT || 6660, function() {
  console.log('%s listening at %s', http.name, http.url);
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
	http,
	io
};