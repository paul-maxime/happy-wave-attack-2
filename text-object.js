'use strict';

class TextObject {
	constructor (x, y, value, time) {
//		console.log(x, y);
		this.style = { font: "bold 32px Pixelade", fill: "#10BB10", boundsAlignH: "left"};
		this.text = game.add.text(0, 0, value, this.style);
		this.text.x = x;
		this.text.y = y - 100;
		this.time = time;
		this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
	}
	update(deltaTime){
		this.text.y -= deltaTime * 40;
		this.time -= deltaTime * 1;
		this.text.alpha += 3;
		if (this.text.alpha > 255){
			this.text.alpha = 255;
		}
		return (this.time);
	}
	destroy(){
		this.text.destroy();
		this.text.kill();
	}
}

class ComboText {
	constructor (){
		this.countKilled = 0;
		this.nbCombos = 0;
		this.remainingTime = 0;
		this.style = { font: "32px Pixelade", fill: "#BB1010", boundsAlignH: "center", boundsAlignV: "middle"};
		this.text = game.add.text(0, 0, "COMBO :  " + this.nbCombos, this.style);
		this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
		this.text.setTextBounds(0, 100, game.world.width, 100);
	}
	update(deltaTime){
		if (this.remainingTime > 0){
			this.remainingTime -= deltaTime;
		}
		else {
			this.nbCombos = 0;
			this.remainingTime = 0;
			this.text.visible = false;
			this.text.fontSize = 32;
		}
		if (this.countKilled < waveAttack.humansKilled){
			let diff = waveAttack.humansKilled - this.countKilled;
			this.nbCombos += diff;
			this.countKilled += diff;
			this.remainingTime = 3;
			if (this.nbCombos > 1){
				this.text.visible = true;
			}
			this.text.fontSize = 32 - 2 + this.nbCombos;
		}
		this.text.text = "COMBO :  " + this.nbCombos;
	}
	setVisibility(value){
		this.text.visible = value;
	}
}
