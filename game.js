'use strict';

class WaveAttack {
	constructor () {
		window.game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
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

		let man = game.add.sprite(0, 0, 'man');
		man.anchor.setTo(0.5, 0.5);
		man.x = game.world.width;
		man.animations.add('default', [0, 1, 2, 3]);
		man.scale.setTo(5, 5);
		man.animations.play('default', 15, true);
		man.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		man.y = game.world.height - man.height / 2;
		for (let i = 0; i < 32; ++i) {
			man.moveDown();
		}
		this.humans.push(man);
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
			man.x -= deltaTime * 75;
		}
	}
};

window.onload = function() {
	new WaveAttack();
};
