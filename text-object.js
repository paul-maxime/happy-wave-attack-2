'use strict';

class TextObject {
	constructor (x, y, value, time) {
//		console.log(x, y);
		this.style = { font: "bold 32px Pixelade", fill: "#00FF00", boundsAlignH: "left"};
		this.text = game.add.text(0, 0, value, this.style);
		this.text.x = x;
		this.text.y = y - 100;
		this.time = time;
	}
	update(deltaTime){
		console.log(deltaTime, this.time);
		this.text.y -= deltaTime * 40;
		this.time -= deltaTime * 1;
		return (this.time);
	}
	destroy(){
		this.text.destroy();
		this.text.kill();
	}
}
