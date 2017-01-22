'use strict';

var HumanType = {
	MAN : 0,
	WOMAN : 1,
	MAN_FLY : 2,
	MISSILE_FAN : 3,
	COUNT : 4
};

class Human {
	constructor(isEnemy) {
		if (isEnemy) {
			this.type = HumanType.MISSILE_FAN;
		} else {
			this.type = game.rnd.integerInRange(1, HumanType.COUNT - 1) - 1;
		}

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

		if (this.type === HumanType.MISSILE_FAN) {
			this.speedX *= 2;
		}

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
			this.sprite.y = game.rnd.integerInRange(200, game.world.height - this.sprite.height / 2);
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
			if (this.sprite.x < waveAttack.wave.width / 1.5 && this.sprite.x > 75 && this.sprite.y - this.sprite.height / 3 > (waveAttack.wave.y - waveAttack.wave.height)) {
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
				this.sprite.scale.x -= 1.5 * deltaTime;
				this.sprite.scale.y -= 1.5 * deltaTime;
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
		let scoreToWin = 250 * ((waveAttack.comboTxt.nbCombos) ? waveAttack.comboTxt.nbCombos : 1);		
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
		waveAttack.reelScore += scoreToWin;
		waveAttack.tabText.push(new TextObject(this.sprite.x, this.sprite.y, scoreToWin, 1.5));
		waveAttack.humansKilled += 1;
	}
	eatenBySea() {
		let scoreToWin = 250 * ((waveAttack.comboTxt.nbCombos) ? waveAttack.comboTxt.nbCombos : 1);
		waveAttack.playCoin();
		waveAttack.updateWaveColor(5);
		waveAttack.reelScore += scoreToWin;
		waveAttack.tabText.push(new TextObject(this.sprite.x, this.sprite.y, scoreToWin, 1.5));
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
