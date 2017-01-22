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
		console.log(this.text.alpha);
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
