var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3333;

io.on("connection", function (socket) {
	console.log('an user connected ' + socket.id);

	socket.player = {
		"x": Math.floor(Math.random(1) * 750),
		"y": Math.floor(Math.random(1) * 550),
		"width": 32, "height": 32,
		"live": true
	};

	io.sockets.emit('add_player', JSON.stringify({
		"id": socket.id,
		"player": socket.player
	}));

	socket.emit('add_players', (function () {
		let players = {};

		Object.keys(io.sockets.sockets).forEach(function (id) {
			players[id] = io.sockets.sockets[id].player;
		});
		return JSON.stringify(players);
	})());

	setInterval(function() {

	}, 100);

	socket.on('disconnect', function () {
		console.log("an user disconnected " + socket.id);
		io.sockets.emit('player_disconnect', socket.id);
	});

	socket.on('player_move', function (data) {
		data = JSON.parse(data);

		if (data.W) {
			socket.player.y -= 5;
		}
		if (data.S) {
			socket.player.y += 5;
		}
		if (data.A) {
			socket.player.x -= 5;
		}
		if (data.D) {
			socket.player.x += 5;
		}
		if (data.rotation != null) {
			socket.player.rotation = data.rotation;
		}

		io.sockets.emit('player_update', JSON.stringify({
			"id": socket.id,
			"shots_fired": data.shots_fired,
			"x": socket.player.x,
			"y": socket.player.y,
			"rotation": data.rotation
		}));
	});

	socket.on('player_killed', function (victimId) {
		//console.log("player killed: " + data.victimId);
		io.sockets.emit('clean_dead_player', victimId);
		io.sockets.connected[victimId].player.live = false;
		//delete players[data.victimId];
	});
});

app.use("/", express.static(__dirname + "/public"));
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

http.listen(port, function () {
	console.log('listening on *:' + port);
});