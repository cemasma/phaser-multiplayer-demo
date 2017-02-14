var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

io.on("connection", function(socket) {
	console.log('an user connected ' + socket.id);
	
	
});

app.use("/", express.static(__dirname + "/public"));
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

http.listen(port, function () {
	console.log('listening on *:' + port);
});