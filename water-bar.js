'use strict';

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
