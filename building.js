'use strict';

class Building
{
	constructor() {
		this.sprite = game.add.sprite(0, 0, this.getTexture(), null, waveAttack.humansGroup);
		this.sprite.anchor.setTo(0, 1);
		this.sprite.x = game.world.width + this.sprite.height;
		this.sprite.y = game.world.height;
		let scale = game.rnd.integerInRange(30, 50) / 10;
		this.sprite.scale.setTo(scale, scale);
		this.sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

		this.speedX = -game.rnd.integerInRange(125, 180);
	}
	getTexture() {
		return 'building' + game.rnd.integerInRange(1, BUILDING_TEXTURE_COUNT);
	}
	update(deltaTime) {
		this.sprite.x += deltaTime * this.speedX;
	}
}
