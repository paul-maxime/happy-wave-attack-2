'use strict';

var waveAttack;
var game;

class Human {
	constructor () {
		this.sprite = game.add.sprite(0, 0, 'man');
		this.sprite.anchor.setTo(0.5, 0.5);
		this.sprite.x = game.world.width + this.sprite.height;
		this.sprite.animations.add('default', [0, 1, 2, 3]);
		let scale = game.rnd.integerInRange(30, 50) / 10;
		this.sprite.scale.setTo(scale, scale);
		this.sprite.animations.play('default', 15, true);
		this.sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.sprite.y = game.world.height - this.sprite.height / 2;
		for (let i = 0; i < 32; ++i) {
			this.sprite.moveDown();
		}
		this.speed = game.rnd.integerInRange(50, 200);
	}
	update (deltaTime) {
		this.sprite.x -= deltaTime * this.speed;
	}
}

class HumanSpawner {
	constructor () {
		this.spawnNextHuman();
	}
	spawnNextHuman () {
		this.nextHuman = game.rnd.integerInRange(500, 3000);
		waveAttack.humans.push(new Human());
	}
	update (deltaTime) {
		this.nextHuman -= deltaTime * 1000;
		if (this.nextHuman < 0) {
			this.spawnNextHuman();
		}
	}
}

class WaveAttack {
	constructor () {
		game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
			preload: this.preload,
			create: this.create,
			update: this.update
		});
	}
	preload () {
		game.load.spritesheet('wave', 'assets/wave.png', 32, 32);
		game.load.spritesheet('water', 'assets/water.png', 32, 32);
		game.load.spritesheet('man', 'assets/monsieur.png', 32, 32);
	}
	create () {
		waveAttack = this;

		this.wave = game.add.sprite(0, 0, 'wave');
		this.wave.anchor.setTo(0, 1);
		this.wave.animations.add('swim');
		this.wave.animations.play('swim', 15, true);
		this.wave.scale.x = 5.0;
		this.wave.scale.y = 10.0;
		this.wave.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.wave.tint = 0x3070FF;
		this.wave.y = game.world.height;

		this.waters = [];
		for (let i = 0; i < 10; ++i) {
			let water = game.add.sprite(0, 0, 'water');
			water.anchor.setTo(0, 1);
			water.scale.setTo(5, 5);
			water.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
			water.animations.add('default');
			water.animations.play('default', 15, true);
			water.x = water.width * i;
			water.tint = 0x3070FF;
			water.y = game.world.height;
			this.waters.push(water);
		}

		this.humans = [];
		this.humanSpawner = new HumanSpawner();
	}
	update () {
		let deltaTime = (game.time.elapsed / 1000);
		let delta = deltaTime * 25;
		// if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
		// 	this.wave.y -= delta;
		// } else {
		// 	this.wave.y += delta
		// }
		// if (this.wave.y > game.world.height - this.wave.height) {
		// 	this.wave.y = game.world.height - this.wave.height;
		// }
		if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
			this.wave.scale.y += delta;
		} else {
			this.wave.scale.y -= delta
		}
		if (this.wave.scale.y < 3.0) {
			this.wave.scale.y = 3.0;
		}
		for (let man of this.humans) {
			man.update(deltaTime);
		}
		this.humanSpawner.update(deltaTime);

	}
};

window.onload = function() {
	new WaveAttack();
};
