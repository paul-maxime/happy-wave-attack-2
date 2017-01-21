'use strict';

var waveAttack;
var game;

const MAN_TEXTURE_COUNT = 4;
const WOMAN_TEXTURE_COUNT = 3;
const SCREAM_COUNT = 9;

var HumanType = {
	MAN : 0,
	WOMAN : 1,
	COUNT : 2
};

class Human {
	constructor() {
		this.type = game.rnd.integerInRange(1, HumanType.COUNT) - 1;

		this.sprite = game.add.sprite(0, 0, this.getTexture(), null, waveAttack.humansGroup);
		this.sprite.anchor.setTo(0.5, 0.5);
		this.sprite.x = game.world.width + this.sprite.height;
		let scale = game.rnd.integerInRange(30, 50) / 10;
		this.sprite.scale.setTo(scale, scale);
		this.sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.sprite.y = game.world.height - this.sprite.height / 2;
		this.setupAnimations();

		this.dying = false;
		this.removed = false;

		this.speedX = -game.rnd.integerInRange(125, 180);
		this.speedY = 0;
		this.rotationSpeed = 0;
	}
	getTexture() {
		if (this.type === HumanType.MAN) {
			return 'man' + game.rnd.integerInRange(1, MAN_TEXTURE_COUNT);
		} else if (this.type === HumanType.WOMAN) {
			return 'woman' + game.rnd.integerInRange(1, WOMAN_TEXTURE_COUNT);
		}
	}
	setupAnimations() {
		if (this.type == HumanType.MAN) {
			this.sprite.animations.add('default', [0, 1, 2, 3]);
			this.sprite.animations.add('dead', [4]);
		} else if (this.type === HumanType.WOMAN) {
			this.sprite.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7]);
			this.sprite.animations.add('dead', [8]);
		}
		this.sprite.animations.play('default', 15, true);
	}
	update(deltaTime) {
		this.sprite.x += deltaTime * this.speedX;
		this.sprite.y += deltaTime * this.speedY;
		if (!this.dying) {
			if (this.sprite.x < waveAttack.wave.width / 1.5 && this.sprite.x > 75 && this.sprite.y < waveAttack.waveHeight) {
				waveAttack.playScream();
				this.dying = true;

				this.rotationSpeed = game.rnd.realInRange(6.0, 9.0);
				if (game.rnd.integerInRange(1, 2) === 1) {
					this.rotationSpeed *= -1;
				}

				let speed = new Phaser.Point(game.rnd.realInRange(0.0, 1.0), game.rnd.realInRange(-1.0, 0.0));
				speed.normalize();
				this.speedX = speed.x * 500;
				this.speedY = speed.y * 500;

				this.sprite.animations.play('dead');
			}
		} else {
			this.sprite.rotation += this.rotationSpeed * deltaTime;

			this.sprite.scale.x -= 3 * deltaTime;
			this.sprite.scale.y -= 3 * deltaTime;
		}
		if (this.sprite.x < -this.sprite.width || this.sprite.x > game.world.width + this.sprite.width ||
			this.sprite.y < -this.sprite.height || this.sprite.y > game.world.height + this.sprite.height) {
			this.remove();
		}
	}
	remove() {
		this.sprite.kill();
		this.removed = true;
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

class Background {
	constructor (image, speed, scale, number) {
		this.speed = speed;
		this.sprites = [];

		for (let i = 0; i < number; ++i) {
			let sprite = game.add.sprite(0, 0, image);
			sprite.scale.setTo(scale, scale);
			sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
			sprite.x = sprite.width * i;
			sprite.y = game.world.height;
			sprite.anchor.setTo(0, 1);
			this.sprites.push(sprite);
		}
	}
	set tint (value) {
		for (let sprite of this.sprites) {
			sprite.tint = value;
		}
	}
	update (deltaTime) {
		for (let sprite of this.sprites) {
			sprite.x -= deltaTime * this.speed;
			if (sprite.x < -sprite.width) {
				sprite.x += sprite.width * this.sprites.length;
			}
		}
	}
}

class WaveAttack {
	constructor () {
		game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
			preload: () => this.preload(),
			create: () => this.create(),
			update: () => this.update()
		});
	}
	preload () {
		game.load.spritesheet('wave', 'assets/wave.png', 32, 32);
		game.load.spritesheet('water', 'assets/water.png', 32, 32);

		for (let i = 1; i <= MAN_TEXTURE_COUNT; ++i) {
			game.load.spritesheet('man' + i, 'assets/monsieur' + i + '.png', 32, 32);
		}
		for (let i = 1; i <= WOMAN_TEXTURE_COUNT; ++i) {
			game.load.spritesheet('woman' + i, 'assets/madame_color' + i + '.png', 32, 32);
		}

		game.load.image('scrolling-front', 'assets/scrolling1.png', 32, 32);
		game.load.image('scrolling-back', 'assets/scrolling2.png', 32, 32);

		for (let i = 1; i <= SCREAM_COUNT; ++i) {
			game.load.audio('scream' + i, 'assets/FXScream' + i + '.ogg');
			let audio = game.add.audio('scream' + i);
			audio.allowMultiple = true;
		}

		for (let i = 1; i <= 3; ++i) {
			game.load.audio('explosion' + i, 'assets/FXexplosion' + i + '.ogg');
			let audio = game.add.audio('explosion' + i);
			audio.allowMultiple = true;
		}

		game.load.audio('song', 'assets/song.ogg');
	}
	create () {
		this.bgBack = new Background('scrolling-back', 25, 10, 3);
		this.bgFront = new Background('scrolling-front', 50, 4, 10);

		this.music = game.add.audio('song', 0.6, true);
		this.music.play();

		this.humansGroup = game.add.group();
		this.waterGroup = game.add.group();

		this.humans = [];
		this.humanSpawner = new HumanSpawner();

		this.wave = game.add.sprite(0, 0, 'wave', null, this.waterGroup);
		this.wave.anchor.setTo(0, 1);
		this.wave.animations.add('swim');
		this.wave.animations.play('swim', 15, true);
		this.wave.scale.x = 5.0;
		this.wave.scale.y = 10.0;
		this.wave.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.wave.tint = 0x3070FF;
		this.wave.y = game.world.height;

		this.bgBack.tint = 0x60B0D0;
		this.bgFront.tint = 0x8090A0;

		this.waters = [];
		for (let i = 0; i < 10; ++i) {
			let water = game.add.sprite(0, 0, 'water', null, this.waterGroup);
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
		this.score = 0;
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
		this.bgBack.update(deltaTime);
		this.bgFront.update(deltaTime);
		if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
			this.wave.scale.y += delta;
		} else {
			this.wave.scale.y -= delta
		}
		if (this.wave.scale.y > 21.0) {
			this.wave.scale.y = 21.0;
		}
		if (this.wave.scale.y < 3.0) {
			this.wave.scale.y = 3.0;
		}
		this.waveHeight = this.wave.height * this.wave.scale.y;
		for (let i = 0; i < this.humans.length; ++i) {
			this.humans[i].update(deltaTime);
			if (this.humans[i].removed) {
				this.humans.splice(i, 1);
				--i;
			}
		}
		this.humanSpawner.update(deltaTime);
	}
	playScream () {
		let index = game.rnd.integerInRange(1, SCREAM_COUNT);
		game.sound.play('scream' + index);
	}
	playExplosion () {
		let index = game.rnd.integerInRange(1, 3);
		game.sound.play('explosion' + index);
	}
};

window.onload = function() {
	waveAttack = new WaveAttack();
};
