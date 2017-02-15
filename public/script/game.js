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
}

function update() {
    if(live) {
		characterController();
		
		players[socket.id].player.rotation = game.physics.arcade.angleToPointer(players[socket.id].player);
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