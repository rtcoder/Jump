if (typeof(Number.prototype.toRad) === "undefined") {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}
}

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// console =  {}
function resize(){
	if(window.innerWidth > 400)
		canvas.setAttribute('width', 400);
	else
		canvas.setAttribute('width', window.innerWidth);

	canvas.setAttribute('height', window.innerHeight);
}

window.addEventListener('resize',resize);

resize();