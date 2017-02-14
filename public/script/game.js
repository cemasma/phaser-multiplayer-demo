var socket, players = {}, live;
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image("player", "img/player.png");
    game.load.image("bullet", "img/bullet.png");
}

function create() {
	
}

function update() {
    if(live) {
		
	}
}