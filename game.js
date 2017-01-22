'use strict';

var waveAttack;
var game;

const MAN_TEXTURE_COUNT = 4;
const WOMAN_TEXTURE_COUNT = 3;
const MAN_FLY_TEXTURE_COUNT = 3;
const MISSILE_FAN_TEXTURE_COUNT = 3;
const BUILDING_TEXTURE_COUNT = 3;
const BUILDING_GUY_TEXTURE_COUNT = 4;

const SCREAM_COUNT = 13;
const EXPLOSION_COUNT = 3;
const COIN_COUNT = 3;

var GameState = {
	INGAME : 0,
	GAMEOVER: 1,
    TITLE : 2
}

class WaveAttack extends Phaser.Game {
	constructor () {
		super(1024, 600);
		this.state.add('game', {
			preload: () => this.onPreload(),
			create: () => this.onCreate(),
			update: () => this.onUpdate()
		}, true);
	}
	onPreload () {
		game.load.spritesheet('wave', 'assets/wave.png', 32, 64);
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
		for (let i = 1; i <= BUILDING_TEXTURE_COUNT; ++i) {
			game.load.spritesheet('building' + i, 'assets/Building' + i + '.png', 64, 64);
		}
		for (let i = 1; i <= BUILDING_GUY_TEXTURE_COUNT; ++i) {
		    game.load.spritesheet('Building_Guy' + i, 'assets/Building_Guy' + i + '.png', 64, 64);
		}

		game.load.image('blood', 'assets/blood.png', 4, 4);
		game.load.spritesheet('Boooom', 'assets/Boooom.png', 32, 32);

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
	onCreate () {
    	game.physics.startSystem(Phaser.Physics.ARCADE);

		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		this.gameState = GameState.TITLE;
		this.restartTimer = 0;
		this.building = null;

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
		this.wave.scale.x = 6.0;
		this.wave.scale.y = 6.0;
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

	    this.emitter = game.add.emitter(0, 0, 2000);

	    this.emitter.makeParticles('blood');
	    this.emitter.gravity = 2000;
	    this.emitter.minParticleSpeed.setTo(-500, -500);
	    this.emitter.maxParticleSpeed.setTo(500, 500);

		this.score = 0;
		this.reelScore = 0;

		this.timer = 0;

		var style = { font: "40px Pixelade", fill: "#fff", boundsAlignH: "left"};
		this.textScore = game.add.text(0, 20, "SCORE     " + this.getStringScore(this.score, 8), style);
	    this.textScore.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
		this.textScore.x = game.world.width - 290;
		this.textScore.visible = false;

		this.timerText = game.add.text(0, 20, this.timeToText(this.timer), { font: "40px Pixelade", fill: "white", boundsAlignH: "left"});
		this.timerText.x = game.world.width / 2 - this.timerText.width / 2;
		this.timerText.visible = false;

		this.currentColor = {r: 0x30, g: 0x70, b: 0xFF};
		this.currentBackColor = {r: 0x80, g: 0x90, b: 0xA0};
		this.updateWaveColor(0);
		this.humansKilled = 0;

		var overlay = new Phaser.Graphics(this.game, 0, 0);
		overlay.beginFill(0x000000, 0.8);
		overlay.drawRect(0,0, game.world.width, game.world.height);
		overlay.endFill();
		this.deathOverlay = game.add.image(0, 0, overlay.generateTexture());
		this.deathOverlay.visible = false;

		this.startText = game.add.text(0, 0, "HOLD SPACE TO PLAY", { font: "20px Pixelade", fill: "white", boundsAlignH: "left" });
		this.startText.x = game.world.width / 2 - this.startText.width / 2;
		this.startText.y = game.world.height / 2 + 50;
		this.startText.visible = true;

		this.gameOverText = game.add.text(0, 0, "GAME OVER", { font: "80px Pixelade", fill: "red", boundsAlignH: "left"});
		this.gameOverText.x = game.world.width / 2 - this.gameOverText.width / 2;
		this.gameOverText.y = game.world.height / 2 - 150;
		this.gameOverText.visible = false;

		this.victoryText = game.add.text(0, 0, "VICTORY!", { font: "80px Pixelade", fill: "green", boundsAlignH: "left"});
		this.victoryText.x = game.world.width / 2 - this.victoryText.width / 2;
		this.victoryText.y = game.world.height / 2 - 150;
		this.victoryText.visible = false;

		this.summaryText = game.add.text(0, 0, "", { font: "25px Pixelade", fill: "white", boundsAlignH: "left"});
		this.summaryText.visible = false;
		this.scoreEndText = game.add.text(0, 0, "", { font: "25px Pixelade", fill: "white", boundsAlignH: "left"});
		this.summaryText.visible = false;

		this.restartText = game.add.text(0, 0, "PRESS SPACE TO RESTART", { font: "20px Pixelade", fill: "white", boundsAlignH: "left"});
		this.restartText.x = game.world.width / 2 - this.restartText.width / 2;
		this.restartText.y = game.world.height - 100;
		this.restartText.visible = false;

		this.tabText = [];
		this.textGroup = game.add.group();
		this.comboTxt = new ComboText();
	}
	start() {
	    this.gameState = GameState.INGAME;

	    this.startText.visible = false;
	    this.textScore.visible = true;
	    this.timerText.visible = true;

	    this.wave.y = game.world.height + this.wave.height - 60;
	    this.humanSpawner.activateSpawn();
	}
	updateScore(scoreToAdd){
		this.score += scoreToAdd;
		this.textScore.text = "SCORE     " + this.getStringScore(this.score, 8);
	}
	updateTimer(deltaTime) {
		this.timer += deltaTime;
		this.timerText.text = this.timeToText(this.timer);
	}
	onUpdate () {
		let deltaTime = (game.time.elapsed / 1000);
		let delta = deltaTime * 500;

		this.bgBack.pause = this.bgFront.pause = (game.building && game.building.isBlocking);
		this.bgBack.update(deltaTime);
		this.bgFront.update(deltaTime);

		if (this.gameState == GameState.TITLE)
		{
		    if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) || game.input.pointer1.isDown)
		    {
		        this.start();
		    }
		} else if (this.gameState == GameState.INGAME) {
			if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) || game.input.pointer1.isDown ||
				(game.building && game.building.isBlocking)) {
				this.waveUp = true;
				this.wave.y -= delta;
			} else {
				this.wave.y += delta
			}
			if (this.wave.y > game.world.height + this.wave.height - 60) {
				this.waveUp = false;
				this.wave.y = game.world.height + this.wave.height - 60;
			}
			if (this.wave.y < game.world.height) {
				this.wave.y = game.world.height;
			}

		} else if (this.gameState == GameState.GAMEOVER) {
			if (this.humansKilled > 0) {
				this.gameOverText.visible = true;
				this.summaryText.text = "The tsunami ended in " + this.timeToText(this.timer) + " seconds and did " + this.humansKilled + " victims.";
				this.scoreEndText.text = "Score: " + this.score;
				this.scoreEndText.x = game.world.width / 2 - this.scoreEndText.width / 2;
				this.scoreEndText.y = game.world.height / 2;
				this.scoreEndText.visible = true;
			} else {
				this.victoryText.visible = true;
				this.summaryText.text = "The tsunami ended in " + this.timeToText(this.timer) + " seconds. Hopefully, no one was hurt.";
			}
			this.summaryText.x = game.world.width / 2 - this.summaryText.width / 2;
			this.summaryText.y = game.world.height / 2 - 50;
			this.summaryText.visible = true;
			this.deathOverlay.visible = true;
			this.waveUp = false;
			this.wave.position.y = game.world.height + this.wave.height;
			this.restartTimer += deltaTime;
			if (this.restartTimer >= 1) {
				this.restartText.visible = true;
				if (game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) || game.input.pointer1.isDown)
				{
				    this.onCreate();
				    this.start();
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
		if (this.gameState == GameState.INGAME) {
			this.waterBar.update(deltaTime);
			this.updateTimer(deltaTime);
		}
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
		this.comboTxt.update(deltaTime);
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
	getStringScore(score, maxScale) {
		let strValue = score.toString();
		while (strValue.length < maxScale){
			strValue = "0" + strValue;
		}
		return (strValue);
	}
	timeToText (time) {
		var str = time.toFixed(2).toString();
		if (str.length <= 4)
			str = '0' + str;
		return (str);
	}
	playScream () {
		let index = game.rnd.integerInRange(1, SCREAM_COUNT);
		game.sound.play('scream' + index, 0.7);
	}
	playExplosion () {
		let index = game.rnd.integerInRange(1, EXPLOSION_COUNT);
		game.sound.play('explosion' + index, 0.8);
	}
	playCoin () {
		let index = game.rnd.integerInRange(1, COIN_COUNT);
		game.sound.play('coin' + index, 0.25);
	}
	isSpaceDown () {
		return game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) || game.input.pointer1.isDown;
	}
};

window.onload = function () {
	setTimeout(function() {
		game = waveAttack = new WaveAttack();
		document.getElementById("loading").style.display = "none";
	}, 3000);
};
