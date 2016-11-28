var keys = {
	right : false,
	left : false,
	space : false
}
document.onkeyup = function(e){
	e = e || window.event;
	
	switch(e.keyCode){
		case 32:
			keys.space = false;
		break;
		case 37:
			keys.left = false;
		break;
		case 39:
			keys.right = false;
		break;
	}
}
document.onkeydown = function(e){
	e = e || window.event;
	
	switch(e.keyCode){
		case 32:
			keys.space = true;
		break;
		case 37:
			keys.left = true;
		break;
		case 39:
			keys.right = true;
		break;
	}
}