var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

io.sockets.on('connection', function(socket) {
	socket.on('listContestants', function(data) {
		socket.broadcast.emit('onContestantsListed', data);
	});

	socket.on('createContestant', function(data) {
		socket.broadcast.emit('onContestantCreated', data);
	});

	socket.on('updateContestant', function(data){
		socket.broadcast.emit('onContestantUpdated', data);
	});

	socket.on('deleteContestant', function(data){
		socket.broadcast.emit('onContestantDeleted', data);
	});
});

server.listen(1337);
