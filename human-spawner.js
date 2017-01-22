'use strict';

class HumanSpawner {
	constructor () {
		this.totalTime = 0;
		this.nextHuman = 0;
		this.nextEnemy = 0;
		this.nextBuilding = 15000;
		this.isSpawnable = false;
	}
	spawnNextHuman () {
		let frequency = 8000 / ((this.totalTime / 22) + 1);
		this.nextHuman = game.rnd.integerInRange(frequency / 2, frequency);
		waveAttack.humans.push(new Human(game.rnd.integerInRange(HumanType.MAN, HumanType.MAN_FLY)));
	}
	spawnNextEnemy () {
		let frequency = 10000 / ((game.humansKilled + 1) / 3);
		this.nextEnemy = game.rnd.integerInRange(frequency / 2, frequency);
		waveAttack.humans.push(new Human(HumanType.MISSILE_FAN));
	}
	spawnNextBuilding () {
		this.nextBuilding = 15000;
		waveAttack.building = new Building();
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
			if (!game.building) {
				this.nextBuilding -= deltaTime * 1000;
				if (this.nextBuilding < 0) {
					this.spawnNextBuilding();
				}
			} else {
				game.building.update(deltaTime);
			}
		}
	}
}
