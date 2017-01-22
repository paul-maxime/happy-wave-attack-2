'use strict';

class Building
{
	constructor() {
		this.sprite = game.add.sprite(0, 0, this.getTexture(), null, waveAttack.humansGroup);
		this.sprite.anchor.setTo(0.5, 1);
		this.sprite.x = game.world.width + this.sprite.width;
		this.sprite.y = game.world.height;
		this.humanSprite = game.add.sprite(0, 0, this.getHumanText(), null, waveAttack.humansGroup);
		this.humanSprite.anchor.setTo(0.5, 1);
		this.humanSprite.x = game.world.width + this.sprite.height;
		this.humanSprite.y = game.world.height;

		this.setUpHumanAnim();

		let scale = game.rnd.integerInRange(40, 60) / 10;
		this.sprite.scale.setTo(scale, scale);
		this.humanSprite.scale.setTo(scale, scale);

		this.sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
		this.humanSprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

		this.speedX = -game.rnd.integerInRange(125, 180);

		this.isBlocking = false;

		this.life = 15;
		this.isAttacking = false;
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
		if (!this.isBlocking) {
			this.sprite.x += deltaTime * this.speedX;
			this.humanSprite.x += deltaTime * this.speedX;
			if (this.sprite.x < game.wave.width) {
				this.isBlocking = true;
			}
		} else {
			if (game.isSpaceDown() && !this.isAttacking) {
				this.isAttacking = true;
				game.humansKilled += 1;
				game.updateWaveColor(1);
				if (this.life % 5 == 0) {
					game.playScream();
				}
				game.playExplosion();
				this.sprite.rotation += 0.05;
				this.sprite.position.y += 9;
				this.humanSprite.rotation += 0.09;
				this.humanSprite.position.y += 10;
				this.humanSprite.position.x -= 6;
				this.life -= 1;
			} else if (!game.isSpaceDown() && this.isAttacking) {
				this.isAttacking = false;
			}
			if (this.life == 0) {
			    this.humanSprite.animations.play('dead');
				this.remove();
			}
		}
	}
	remove() {
	    this.sprite.kill();
	    this.humanSprite.kill();
		game.building = null;
	}
}
