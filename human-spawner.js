'use strict';

class HumanSpawner {
	constructor () {
		this.spawnNextHuman();
	}
	spawnNextHuman () {
		this.nextHuman = game.rnd.integerInRange(300, 500);
		waveAttack.humans.push(new Human());
	}
	update (deltaTime) {
		this.nextHuman -= deltaTime * 1000;
		if (this.nextHuman < 0) {
			this.spawnNextHuman();
		}
	}
}
