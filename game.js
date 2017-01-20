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
		game.load.spritesheet('wave', 'wave.png', 32, 32);
	}
	create () {
		this.wave = game.add.sprite(0, 0, 'wave');
		this.wave.anchor.setTo(0, 1);
		this.wave.animations.add('swim');
		this.wave.animations.play('swim', 15, true);
		this.wave.scale.x = 10.0;
		this.wave.scale.y = 10.0;
		this.wave.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.wave.tint = 0x3070FF;
		this.wave.y = game.world.height;
	}
	update () {
		let delta = (game.time.elapsed / 1000) * 25;
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
	}
};

window.onload = function() {
	new WaveAttack();
};
