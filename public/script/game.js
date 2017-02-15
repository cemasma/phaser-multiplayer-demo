var socket, players = {}, live;
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image("player", "img/player.png");
    game.load.image("bullet", "img/bullet.png");
}

function create() {
	socket = io.connect(window.location.host);
    game.physics.startSystem(Phaser.Physics.ARCADE);
	
	socket.on("add_players", function (data) {
        data = JSON.parse(data);

        for (let playerId in data) {
            if (players[playerId] == null && data[playerId].live) {
                addPlayer(playerId, data[playerId].x, data[playerId].y);
            }
        }
        live = true;
    });

    socket.on("add_player", function (data) {
        data = JSON.parse(data);

        if (data.player.live) {
            addPlayer(data.id, data.player.x, data.player.y);
        }
    });
	
	socket.on("player_position_update", function (data) {
        data = JSON.parse(data);

        players[data.id].player.x += data.x;
        players[data.id].player.y += data.y;
    });

    socket.on("player_rotation_update", function (data) {
        data = JSON.parse(data);
        players[data.id].player.rotation = data.value;
    });

    socket.on('player_disconnect', function (id) {
        players[id].player.kill();
        //delete players[id];
    });

    socket.on('player_fire_add', function (id) {
        players[id].weapon.fire();
    });
	
	socket.on('clean_dead_player', function (victimId) {
        if (victimId == socket.id) {
            live = false;
        }
        players[victimId].player.kill();
        //players[victimId].weapon.kill();
        //delete players[victimId];
    });
}

function update() {
    if(live) {
		characterController();
		
		players[socket.id].player.rotation = game.physics.arcade.angleToPointer(players[socket.id].player);
		socket.emit("player_rotation", players[socket.id].player.rotation);
	}
	setCollisions();
}

function bulletHitHandler(player, bullet) {
    socket.emit("player_killed", player.id);
    bullet.destroy();
}

function setCollisions() {
    for (let x in players) {
        for (let y in players) {
            if (x != y) {
                game.physics.arcade.collide(players[x].weapon.bullets, players[y].player, bulletHitHandler, null, this);
            }
        }
    }
}

function sendPosition(character) {
    socket.emit("player_move", JSON.stringify(
        {
            "id": socket.id,
            "character": character
        }
    ));
}

function characterController() {
    if (game.input.activePointer.leftButton.isDown) {
        socket.emit("shots_fired", socket.id);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        //players[socket.id].player.x -= 5;
        sendPosition("A");
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
        //players[socket.id].player.x += 5;
        sendPosition("D");
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
        //players[socket.id].player.y -= 5;
        sendPosition("W");
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
        //players[socket.id].player.y += 5;
        sendPosition("S");
    }
}

function addPlayer(playerId, x, y) {
    let player = game.add.sprite(x, y, "player");
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.anchor.set(0.5);
    player.body.drag.set(70);

    let weapon = game.add.weapon(30, 'bullet');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 600;
    weapon.fireRate = 100;

    weapon.trackSprite(player, 0, 0, true);
    player.id = playerId;
    players[playerId] = { player, weapon };
}