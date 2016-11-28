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
	var platformsToDelete=[];
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
				ctx.strokeStyle = 'transparent';
				ctx.fillStyle = 'brown';
		}
		if(p[i].number==Game.current){
			ctx.fillStyle = 'rgb(156, 131, 43)';
		}
		ctx.rect(p[i].x, canvas.height-p[i].y-p[i].height, p[i].width, p[i].height);
		ctx.fill();
		ctx.stroke();

		if(p[i].number % 100 == 0){
			ctx.beginPath();
			ctx.fillStyle = '#fff';
			ctx.font = '10pt monospace';
			ctx.fillText(p[i].number, (canvas.width+p[i].x)/2, canvas.height-p[i].y-p[i].height/4);
			ctx.fill();
			ctx.stroke();
		}
		if(Game.fallingPlatforms){
			p[i].y-=0.2+Game.score/1000;
		}
		if(p[i].y+p[i].height < 0){
			platformsToDelete.push(i);
		}
	};

	if(platformsToDelete.length > 0){
		for (var i = 0; i < platformsToDelete.length; i++) {
			Game.platforms.splice(platformsToDelete[i],1);
		}
	}
	if(Game.platforms.length <= 10){
		Game.generatePlatofrms(100);
	}
	drawPlayer();
}
