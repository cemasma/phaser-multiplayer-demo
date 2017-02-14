var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var players = {};

io.on("connection", function(socket) {
	console.log('an user connected ' + socket.id);
	
	players[socket.id] = {
		"x": Math.floor(Math.random(1) * 750),
		"y": Math.floor(Math.random(1) * 550),
		"width": 32, "height": 32,
		"live": true
	};
});

app.use("/", express.static(__dirname + "/public"));
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

http.listen(port, function () {
	console.log('listening on *:' + port);
});