'use strict';

class Building
{
	constructor() {
		this.sprite = game.add.sprite(0, 0, this.getTexture(), null, waveAttack.humansGroup);
		this.sprite.anchor.setTo(0, 1);
		this.sprite.x = game.world.width + this.sprite.height;
		this.sprite.y = game.world.height;
		this.humanSprite = game.add.sprite(0, 0, this.getHumanText(), null, waveAttack.humansGroup);
		this.humanSprite.anchor.setTo(0, 1);
		this.humanSprite.x = game.world.width + this.sprite.height;
		this.humanSprite.y = game.world.height;

		this.setUpHumanAnim();

		let scale = game.rnd.integerInRange(30, 50) / 10;
		this.sprite.scale.setTo(scale, scale);
		this.humanSprite.scale.setTo(scale, scale);

		this.sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.humanSprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

		this.speedX = -game.rnd.integerInRange(125, 180);
	}
	getTexture() {
		return 'building' + game.rnd.integerInRange(1, BUILDING_TEXTURE_COUNT);
	}
	getHumanText(){
	    return 'Building_Guy' + game.rnd.integerInRange(1, BUILDING_GUY_TEXTURE_COUNT);
	}
	setUpHumanAnim() {
	    this.humanSprite.animations.add('default', [0, 1, 2, 3]);
	    this.humanSprite.animations.add('dead', [4]);
	    this.humanSprite.animations.play('default', 15, true);
	}
	update(deltaTime) {
	    this.sprite.x += deltaTime * this.speedX;
	    this.humanSprite.x += deltaTime * this.speedX;
	}
}
