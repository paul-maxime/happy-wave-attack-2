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

		this.isBlocking = false;

		this.life = 15;
		this.isAttacking = false;
	}
	getTexture() {
		return 'building' + game.rnd.integerInRange(1, BUILDING_TEXTURE_COUNT);
	}
	update(deltaTime) {
		if (!this.isBlocking) {
			this.sprite.x += deltaTime * this.speedX;
			if (this.sprite.x < game.wave.width / 2 && game.waveUp) {
				this.isBlocking = true;
			}
		} else {
			if (game.isSpaceDown() && !this.isAttacking) {
				this.isAttacking = true;
				this.life -= 1;
			} else if (!game.isSpaceDown() && this.isAttacking) {
				this.isAttacking = false;
			}
			if (this.life == 0) {
				this.remove();
			}
		}
	}
	remove() {
		this.sprite.kill();
		game.building = null;
	}
}
