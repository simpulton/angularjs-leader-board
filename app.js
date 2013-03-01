var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

var contestants = [];

io.sockets.on('connection', function(socket) {

	socket.on('listContestants', function(data) {
    socket.emit('onContestantsListed', contestants);
	});

	socket.on('createContestant', function(data) {
    contestants.push(data);
    socket.broadcast.emit('onContestantCreated', data);
	});

	socket.on('updateContestant', function(data){
    contestants.forEach(function(person){
      if (person.id === data.id) {
        person.display_name = data.display_name;
        person.score = data.score;
        break;
      }
    });
    socket.broadcast.emit('onContestantUpdated', data);
	});

	socket.on('deleteContestant', function(data){
    contestants = contestants.filter(function(person) {
      return person.id !== data.id;
    });
    socket.broadcast.emit('onContestantDeleted', data);
	});
});

server.listen(1337);
