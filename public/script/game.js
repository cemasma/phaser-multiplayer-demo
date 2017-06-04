let socket, players = {};
game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

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
            addPlayer(playerId, data[playerId].x, data[playerId].y);
        }
    });

    socket.on("add_player", function (data) {
        data = JSON.parse(data);

        if (data.id != socket.id) {
            addPlayer(data.id, data.player.x, data.player.y);
        }
    });

    socket.on("player_update", function (data) {
        data = JSON.parse(data);

        players[data.id].player.x = data.x;
        players[data.id].player.y = data.y;

        if (data.rotation != null) {
            players[data.id].player.rotation = data.rotation;
        }

        if (data.shots_fired) {
            players[data.id].weapon.fire();
        }
    });

    socket.on('player_disconnect', function (id) {
        players[id].player.kill();
    });

    socket.on('clean_dead_player', function (victimId) {
        if (victimId == socket.id) {
            players[socket.id].live = false;
        }
        players[victimId].player.kill();
    });
}

function update() {
    if (players[socket.id] != null && players[socket.id].live) {
        characterController();
    }
    setCollisions();
}

function characterController() {
    socket.emit("player_move", JSON.stringify({
        "shots_fired": game.input.activePointer.leftButton.isDown,
        "A": game.input.keyboard.isDown(Phaser.Keyboard.A),
        "D": game.input.keyboard.isDown(Phaser.Keyboard.D),
        "W": game.input.keyboard.isDown(Phaser.Keyboard.W),
        "S": game.input.keyboard.isDown(Phaser.Keyboard.S),
        "rotation":
        (players[socket.id].player.rotation != game.physics.arcade.angleToPointer(players[socket.id].player)) ?
            game.physics.arcade.angleToPointer(players[socket.id].player) : null
    }));
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
    players[playerId] = { player, weapon, "live": true };
}