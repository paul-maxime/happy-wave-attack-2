'use strict';

class Background {
	constructor (image, speed, scale, number) {
		this.speed = speed;
		this.sprites = [];
		this.pause = false;

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
		if (!this.pause) {
			for (let sprite of this.sprites) {
				sprite.x -= deltaTime * this.speed;
				if (sprite.x < -sprite.width) {
					sprite.x += sprite.width * this.sprites.length;
				}
			}
		}
	}
}
