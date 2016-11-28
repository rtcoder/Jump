function drawPlayer(){
	var radiusHead = 20;
	var radiusEye = 2;
	var legsHeight = 25;
	var eyeDistance= 5;

	// head
	ctx.beginPath();
	ctx.rect(Player.x, canvas.height-Player.y-Player.height-radiusHead/2, radiusHead, radiusHead);
	ctx.fillStyle = 'green';
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'transparent';
	ctx.stroke();
	// eye
	ctx.beginPath();
	ctx.arc(Player.x+Player.width/2+eyeDistance, canvas.height-Player.y-Player.height, radiusEye, 0,2 * Math.PI, false);
	ctx.arc(Player.x+Player.width/2-eyeDistance, canvas.height-Player.y-Player.height, radiusEye, 0,2 * Math.PI, false);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.strokeStyle = 'transparent';
	ctx.stroke();

	//body
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle="green";
	ctx.moveTo(Player.x+Player.width/2, canvas.height-Player.y-Player.height+radiusHead);
	ctx.lineTo(Player.x+Player.width/2, canvas.height-Player.y-legsHeight);
	ctx.stroke();

	// legs
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle="green";
	ctx.moveTo(Player.x+Player.width/2, canvas.height-Player.y-legsHeight);
	ctx.lineTo(Player.x+Player.width/2+playerAction.playerI*2/3+5, canvas.height-Player.y-legsHeight/2);
	ctx.lineTo(Player.x+Player.width/2+playerAction.playerI+3, canvas.height-Player.y);
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle="green";
	ctx.moveTo(Player.x+Player.width/2, canvas.height-Player.y-legsHeight);
	ctx.lineTo(Player.x+Player.width/2-playerAction.playerI*2/3-5, canvas.height-Player.y-legsHeight/2);
	ctx.lineTo(Player.x+Player.width/2-playerAction.playerI-3, canvas.height-Player.y);
	ctx.stroke();
}
function drawView(){
	var p = Game.platforms;
	for (var i = 0; i < p.length; i++) {
		ctx.beginPath();
		switch(p[i].attribute){
			case "scaffolding":
				ctx.strokeStyle = '#c5c5c5';
				ctx.fillStyle = '#a7a7a7';
			break;
			case "wall":
				ctx.fillStyle = 'brown';
				ctx.strokeStyle = 'transparent';
			break;
			default:
				ctx.strokeStyle = '#73d216';
				ctx.fillStyle = 'brown';
		}
		ctx.rect(p[i].x, canvas.height-p[i].y-p[i].height, p[i].width, p[i].height);
		ctx.fill();
		ctx.stroke();
		if(Game.isStarted){
			p[i].y-=0.2;
		}
	};

	drawPlayer();
}