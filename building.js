'use strict';

class Building
{
	constructor() {
		this.sprite = game.add.sprite(0, 0, this.getTexture(), null, waveAttack.humansGroup);
		this.sprite.anchor.setTo(0.5, 1);
		this.humanSprite = game.add.sprite(0, 0, this.getHumanText(), null, waveAttack.humansGroup);
		this.humanSprite.anchor.setTo(0.5, 1);

		this.setUpHumanAnim();

		this.scale = game.rnd.integerInRange(40, 60) / 10;
		this.sprite.scale.setTo(this.scale, this.scale);
		this.humanSprite.scale.setTo(this.scale, this.scale);

		this.sprite.x = game.world.width + this.sprite.width;
		this.sprite.y = game.world.height;
		this.humanSprite.x = game.world.width + this.sprite.width;
		this.humanSprite.y = game.world.height;

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
	    this.sprite.animations.add('dead', [4]);
	    this.humanSprite.animations.play('default', 15, true);
	}
	setUpBoooom() {
	    this.boooomSprite.anchor.setTo(0.5, 1);
	    this.boooomSprite.scale.setTo(this.scale + 5, this.scale + 5);
	    this.boooomSprite.x = this.sprite.x + 60;
	    this.boooomSprite.y = game.world.height - 40;
	    this.boooomSprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
	    this.boooomSprite.animations.add('default', [0, 1, 2, 3]);
	    this.boooomSprite.animations.play('default', 15, false, true);
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
				let scoreToWin = 250 * ((waveAttack.comboTxt.nbCombos) ? waveAttack.comboTxt.nbCombos : 1);
				this.isAttacking = true;
				game.humansKilled += 1;
				game.updateWaveColor(1);
				if (this.life % 5 == 0) {
					game.playScream();
				}
				if (this.life == 12)
				{
				    this.sprite.animations.play('dead');
				}
				game.playExplosion();

				waveAttack.emitter.x = this.sprite.x// + this.sprite.width / 2;
		    	waveAttack.emitter.y = this.sprite.y - this.sprite.height / 2;

			    waveAttack.emitter.start(true, 1000, null, 100);

				this.sprite.rotation += 0.05;
				this.sprite.position.y += 9;
				this.humanSprite.rotation += 0.09;
				this.humanSprite.position.y += 10;
				this.humanSprite.position.x -= 6;
				this.life -= 1;
				waveAttack.reelScore += scoreToWin;
				waveAttack.tabText.push(new TextObject(this.sprite.x, this.sprite.y, scoreToWin, 1.5));
			} else if (!game.isSpaceDown() && this.isAttacking) {
				this.isAttacking = false;
			}
			if (this.life == 0) {
			    this.humanSprite.animations.play('dead');
			    this.boooomSprite = game.add.sprite(0, 0, 'Boooom', null, waveAttack.humansGroup);
			    this.setUpBoooom();
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
