'use strict';

class HumanSpawner {
	constructor () {
		this.totalTime = 0;
		this.nextHuman = 0;
		this.nextEnemy = 0;
		this.isSpawnable = false;
	}
	spawnNextHuman () {
		let frequency = 10000 / ((this.totalTime / 20) + 1);
		this.nextHuman = game.rnd.integerInRange(frequency / 2, frequency);
		waveAttack.humans.push(new Human(false));
	}
	spawnNextEnemy () {
		let frequency = 10000 / ((game.humansKilled + 1) / 2);
		this.nextEnemy = game.rnd.integerInRange(frequency / 2, frequency);
		waveAttack.humans.push(new Human(true));
	}
	activateSpawn() {
	    this.isSpawnable = true;
	}
	desactivateSpawn() {
	    this.isSpawnable = false;
	}
	update(deltaTime) {
	    if (!this.isSpawnable)
	        return;
		this.totalTime += deltaTime;
		this.nextHuman -= deltaTime * 1000;
		if (this.nextHuman < 0) {
			this.spawnNextHuman();
		}
		if (game.humansKilled > 0) {
			this.nextEnemy -= deltaTime * 1000;
			if (this.nextEnemy < 0) {
				this.spawnNextEnemy();
			}
		}
	}
}
