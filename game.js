'use strict';

var waveAttack;
var game;

const MAN_TEXTURE_COUNT = 4;
const WOMAN_TEXTURE_COUNT = 3;
const MAN_FLY_TEXTURE_COUNT = 3;
const MISSILE_FAN_TEXTURE_COUNT = 3;

const SCREAM_COUNT = 9;
const EXPLOSION_COUNT = 3;
const COIN_COUNT = 3;

var HumanType = {
	MAN : 0,
	WOMAN : 1,
	MAN_FLY : 2,
	MISSILE_FAN : 3,
	COUNT : 4
};

var GameState = {
	INGAME : 0,
	GAMEOVER : 1
}

class Human {
	constructor() {
		this.type = game.rnd.integerInRange(1, HumanType.COUNT) - 1;

		this.sprite = game.add.sprite(0, 0, this.getTexture(), null, waveAttack.humansGroup);
		this.sprite.anchor.setTo(0.5, 0.5);
		this.sprite.x = game.world.width + this.sprite.height;
		let scale = game.rnd.integerInRange(30, 50) / 10;
		this.sprite.scale.setTo(scale, scale);
		this.sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

		this.setupPosition();
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
		} else if (this.type === HumanType.MAN_FLY) {
			return 'man_fly' + game.rnd.integerInRange(1, MAN_FLY_TEXTURE_COUNT);
		} else if (this.type === HumanType.MISSILE_FAN) {
			return 'missile_fan' + game.rnd.integerInRange(1, MISSILE_FAN_TEXTURE_COUNT);
		}
	}
	setupPosition() {
		if (this.type === HumanType.MAN || this.type == HumanType.WOMAN) {
			this.sprite.y = game.world.height - this.sprite.height / 2;
		} else {
			this.sprite.y = game.rnd.integerInRange(100, game.world.height - this.sprite.height);
		}
	}
	setupAnimations() {
		if (this.type == HumanType.MAN || this.type === HumanType.MAN_FLY) {
			this.sprite.animations.add('default', [0, 1, 2, 3]);
			this.sprite.animations.add('dead', [4]);
		} else if (this.type === HumanType.WOMAN) {
			this.sprite.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7]);
			this.sprite.animations.add('dead', [8]);
		} else if (this.type === HumanType.MISSILE_FAN) {
			this.sprite.animations.add('default', [0, 1, 2, 3]);
		}
		this.sprite.animations.play('default', 15, true);
	}
	update(deltaTime) {
		this.sprite.x += deltaTime * this.speedX;
		this.sprite.y += deltaTime * this.speedY;
		if (!this.dying) {
			if (this.sprite.x < waveAttack.wave.width / 1.5 && this.sprite.x > 75 && this.sprite.y - this.sprite.height / 3 > (game.world.height - waveAttack.wave.height / 1.6)) {
				if (this.type === HumanType.MISSILE_FAN) {
					this.dieAsEnemy();
				} else {
					this.dieAsHuman();
				}
			}
		} else {
			this.sprite.rotation += this.rotationSpeed * deltaTime;
			this.speedY += 500 * deltaTime;

			if (this.sprite.scale.x > 0.1) {
				this.sprite.scale.x -= 2 * deltaTime;
				this.sprite.scale.y -= 2 * deltaTime;
			}

			this.sprite.tint = 0xC03030;
		}
		if (this.sprite.x < -this.sprite.width || this.sprite.x > game.world.width + this.sprite.width ||
			this.sprite.y < -this.sprite.height || this.sprite.y > game.world.height + this.sprite.height) {
			if (this.dying) {
				this.eatenBySea();
			}
			this.remove();
		}
	}
	dieAsHuman() {
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

		waveAttack.waterBar.addWater(10);
		waveAttack.reelScore += 250;
		waveAttack.tabText.push(new TextObject(this.sprite.x, this.sprite.y, 250, 1.5));
		waveAttack.humansKilled += 1;
	}
	eatenBySea() {
		waveAttack.playCoin();
		waveAttack.updateWaveColor(5);
		waveAttack.reelScore += 250;
		waveAttack.tabText.push(new TextObject(this.sprite.x, this.sprite.y, 250, 1.5));
	}
	dieAsEnemy() {
		waveAttack.playExplosion();
		waveAttack.waterBar.removeWater(10);
		this.remove();
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
		this.nextHuman = game.rnd.integerInRange(300, 500);
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

class WaterBar {
	constructor (scale, posX, posY, defaultColor) {
		this.maxValue = 100;
		this.curValue = this.maxValue;

		this.maskOffsetStart = 23;
		this.maskOffsetEnd = -5;

		this.mask = new PIXI.Graphics();

		this.backgroundSprite = game.add.sprite(posX, posY, 'life_bar_background', null, waveAttack.uiGroup);
		this.backgroundSprite.scale.setTo(scale, scale);
		this.backgroundSprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

		this.middleSprite = game.add.sprite(posX, posY, 'life_bar_middle', null, waveAttack.uiGroup);
		this.middleSprite.scale.setTo(scale, scale);
		this.middleSprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.middleSprite.animations.add('default');
		this.middleSprite.animations.play('default', 15, true);
		this.middleSprite.tint = defaultColor;
		this.calcMask();

		this.borderSprite = game.add.sprite(posX, posY, 'life_bar_border', null, waveAttack.uiGroup);
		this.borderSprite.scale.setTo(scale, scale);
		this.borderSprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
	}
	calcMask () {
		var perc = this.curValue / this.maxValue;

		this.mask.position.x = 0;
		this.mask.position.y = 0;
		this.mask.clear();
		this.mask.beginFill(0, 1);
		this.mask.moveTo(this.maskOffsetStart, 0);
		this.mask.lineTo(this.middleSprite.width * perc - this.maskOffsetEnd, 0);
		this.mask.lineTo(this.middleSprite.width * perc - this.maskOffsetEnd, this.middleSprite.height);
		this.mask.lineTo(this.maskOffsetStart, this.middleSprite.height);
		this.mask.lineTo(this.maskOffsetStart, 0);
		this.mask.endFill();

		this.middleSprite.mask = this.mask;
	}
	set tint (value) {
		this.middleSprite.tint = value;
	}
	removeWater (value) {
		this.curValue -= value;
		if (this.curValue < 0)
			this.curValue = 0;
	}
	addWater (value) {
		this.curValue += value;
		if (this.curValue > this.maxValue)
			this.curValue = this.maxValue;
	}
	update (deltaTime) {
		if (waveAttack.waveUp) {
			this.removeWater(5 * deltaTime);
		} else {
			this.removeWater(1 * deltaTime);
		}
		this.calcMask();
		if (this.curValue == 0)
		{
			waveAttack.gameState = GameState.GAMEOVER;
		}
	}
}

class TextObject {
	constructor (x, y, value, time) {
//		console.log(x, y);
		this.style = { font: "bold 32px Pixeleris", fill: "#00FF00", boundsAlignH: "left"};
		this.text = game.add.text(0, 0, value, this.style);
		this.text.x = x;
		this.text.y = y - 100;
		this.time = time;
	}
	update(deltaTime){
		console.log(deltaTime, this.time);
		this.text.y -= deltaTime * 40;
		this.time -= deltaTime * 1;
		return (this.time);
	}
	destroy(){
		this.text.destroy();
		this.text.kill();
	}
}

class WaveAttack {
	constructor () {
		game = new Phaser.Game(1024, 600, Phaser.AUTO, '', {
			preload: () => this.preload(),
			create: () => this.create(),
			update: () => this.update()
		});
	}
	getStringScore(score, maxScale) {
		let strValue = score.toString();
		while (strValue.length < maxScale){
			strValue = "0" + strValue;
		}
		return (strValue);
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
		for (let i = 1; i <= WOMAN_TEXTURE_COUNT; ++i) {
			game.load.spritesheet('man_fly' + i, 'assets/man_fly' + i + '.png', 32, 32);
		}
		for (let i = 1; i <= WOMAN_TEXTURE_COUNT; ++i) {
			game.load.spritesheet('missile_fan' + i, 'assets/missile_fan' + i + '.png', 32, 32);
		}

		game.load.image('scrolling-front', 'assets/scrolling1.png', 32, 32);
		game.load.image('scrolling-back', 'assets/scrolling2.png', 32, 32);

		game.load.image('life_bar_border', 'assets/life_bar_border.png', 64, 16);
		game.load.image('life_bar_background', 'assets/life_bar_background.png', 64, 16);
		game.load.spritesheet('life_bar_middle', 'assets/life_bar_middle.png', 64, 16);

		for (let i = 1; i <= SCREAM_COUNT; ++i) {
			game.load.audio('scream' + i, 'assets/FXScream' + i + '.ogg');
			let audio = game.add.audio('scream' + i);
			audio.allowMultiple = true;
		}

		for (let i = 1; i <= EXPLOSION_COUNT; ++i) {
			game.load.audio('explosion' + i, 'assets/FXexplosion' + i + '.ogg');
			let audio = game.add.audio('explosion' + i);
			audio.allowMultiple = true;
		}
		for (let i = 1; i <= COIN_COUNT; ++i) {
			game.load.audio('coin' + i, 'assets/FXcoin' + i + '.ogg');
			let audio = game.add.audio('coin' + i);
			audio.allowMultiple = true;
		}

		game.load.audio('song', 'assets/song.ogg');
	}
	create () {
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		this.gameState = GameState.INGAME;
		this.restartTimer = 0;

		this.bgBack = new Background('scrolling-back', 25, 10, 3);
		this.bgFront = new Background('scrolling-front', 50, 4, 10);

		this.waterBar = new WaterBar(4, 8, 8, 0x3070FF);

		this.music = game.add.audio('song', 0.7, true);
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
		this.wave.y = game.world.height;

		this.waveUp = false;

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
			water.y = game.world.height;
			this.waters.push(water);
		}
		this.score = 0;
		this.reelScore = 0;

		var style = { font: "bold 32px Pixeleris", fill: "#fff", boundsAlignH: "left"};
		this.textScore = game.add.text(0, 0, "score     " + this.getStringScore(this.score, 8), style);
	    this.textScore.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
		this.textScore.x = game.world.width - 250;
		this.textScore.y = 20;

		this.currentColor = {r: 0x30, g: 0x70, b: 0xFF};
		this.currentBackColor = {r: 0x80, g: 0x90, b: 0xA0};
		this.updateWaveColor(0);
		this.humansKilled = 0;

		var overlay = new Phaser.Graphics(this.game, 0, 0);
		overlay.beginFill(0x000000, 0.7);
		overlay.drawRect(0,0, game.world.width, game.world.height);
		overlay.endFill();
		this.deathOverlay = game.add.image(0, 0, overlay.generateTexture());
		this.deathOverlay.visible = false;

		this.gameOverText = game.add.text(0, 0, "GAME OVER", { font: "50px Pixeleris", fill: "red", boundsAlignH: "left"});
		this.gameOverText.x = game.world.width / 2 - this.gameOverText.width / 2;
		this.gameOverText.y = game.world.height / 2 - 100;		
		this.gameOverText.visible = false;

		this.restartText = game.add.text(0, 0, "PRESS SPACE TO RESTART", { font: "20px Pixeleris", fill: "white", boundsAlignH: "left"});
		this.restartText.x = game.world.width / 2 - this.restartText.width / 2;
		this.restartText.y = game.world.height / 2 + 50;		
		this.restartText.visible = false;

		this.tabText = [];
		this.textGroup = game.add.group();
	}
	updateScore(scoreToAdd){
		this.score += scoreToAdd;
		this.textScore.text = "score     " + this.getStringScore(this.score, 8);
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
		if (this.gameState == GameState.INGAME) {
			if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) || game.input.pointer1.isDown) {
				this.waveUp = true;
				this.wave.scale.y += delta;
			} else {
				this.wave.scale.y -= delta
			}			
			if (this.wave.scale.y > 21.0) {
				this.wave.scale.y = 21.0;
			}
			if (this.wave.scale.y < 3.0) {
				this.waveUp = false;
				this.wave.scale.y = 3.0;
			}
		} else if (this.gameState == GameState.GAMEOVER) {
			this.gameOverText.visible = true;
			this.deathOverlay.visible = true;
			this.waveUp = false;
			this.wave.scale.y = 2.0;
			this.restartTimer += deltaTime;
			if (this.restartTimer >= 1) {
				this.restartText.visible = true;
				if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) || game.input.pointer1.isDown)
				{
					this.create();
				}
			}
		}
		for (let i = 0; i < this.humans.length; ++i) {
			this.humans[i].update(deltaTime);
			if (this.humans[i].removed) {
				this.humans.splice(i, 1);
				--i;
			}
		}
		this.humanSpawner.update(deltaTime);
		if (this.gameState == GameState.INGAME)
			this.waterBar.update(deltaTime);
		if (this.reelScore > this.score){
			this.updateScore((((this.reelScore - this.score) / 10) | 0) + 1);
		}
		for (let i = 0; i < this.tabText.length; ++i){
			if (this.tabText[i].update(deltaTime) <= 0){
				this.tabText[i].destroy();
				this.tabText.splice(i, 1);
				--i;
			}
		}
	}
	updateWaveColor(delta) {
		this.currentColor.r += delta * 0.5;
		if (this.currentColor.r > 255) this.currentColor.r = 255;
		this.currentColor.b -= delta * 1.0;
		if (this.currentColor.b < 0) this.currentColor.b = 0;
		this.currentColor.g -= delta * 1.5;
		if (this.currentColor.g < 0) this.currentColor.g = 0;
		let color = (this.currentColor.r << 16) + (this.currentColor.g << 8) + this.currentColor.b;
		this.wave.tint = color;
		for (let water of this.waters) {
			water.tint = color;
		}
		this.waterBar.tint = color;

		this.currentBackColor.r += delta * 0.2;
		if (this.currentBackColor.r > 255) this.currentBackColor.r = 255;
		this.currentBackColor.b -= delta * 0.4;
		if (this.currentBackColor.b < 0) this.currentBackColor.b = 0;
		this.currentBackColor.g -= delta * 0.6;
		if (this.currentBackColor.g < 0) this.currentBackColor.g = 0;
		color = (this.currentBackColor.r << 16) + (this.currentBackColor.g << 8) + this.currentBackColor.b;
		this.bgBack.tint = color;
	}
	playScream () {
		let index = game.rnd.integerInRange(1, SCREAM_COUNT);
		game.sound.play('scream' + index);
	}
	playExplosion () {
		let index = game.rnd.integerInRange(1, EXPLOSION_COUNT);
		game.sound.play('explosion' + index);
	}
	playCoin () {
		let index = game.rnd.integerInRange(1, COIN_COUNT);
		game.sound.play('coin' + index, 0.3);
	}
};

$(document).ready(function () {
	waveAttack = new WaveAttack();
});
