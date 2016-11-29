function drawPlayer(){
	var headSize = 10;
	var radiusEye = 2;
	var legsHeight = 20;
	var eyeDistance= 4;
	// head
	ctx.beginPath();
	ctx.arc(Player.x+Player.width/2, canvas.height-Player.y-Player.height, headSize, 0,2 * Math.PI, false);
	ctx.fillStyle = Player.color;
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
	ctx.strokeStyle=Player.color;
	ctx.moveTo(Player.x+Player.width/2, canvas.height-Player.y-Player.height+headSize);
	ctx.lineTo(Player.x+Player.width/2, canvas.height-Player.y-legsHeight);
	ctx.stroke();
	// leg1
	ctx.beginPath();
	ctx.moveTo(Player.x+Player.width/2, canvas.height-Player.y-legsHeight);
	ctx.lineTo(Player.x+Player.width/2+playerAction.playerI*2/3+5, canvas.height-Player.y-legsHeight/2);
	ctx.lineTo(Player.x+Player.width/2+playerAction.playerI+3, canvas.height-Player.y);
	ctx.stroke();
	// leg2
	ctx.beginPath();
	ctx.moveTo(Player.x+Player.width/2, canvas.height-Player.y-legsHeight);
	ctx.lineTo(Player.x+Player.width/2-playerAction.playerI*2/3-5, canvas.height-Player.y-legsHeight/2);
	ctx.lineTo(Player.x+Player.width/2-playerAction.playerI-3, canvas.height-Player.y);
	ctx.stroke();
}
function drawView(){
	var p = Game.platforms;
	for (var i = 0; i < p.length; i++) {
		if(canvas.height-p[i].y > 0){
			var sectionNr = Math.floor(p[i].number/100);
			ctx.beginPath();
			ctx.fillStyle = Game.colors[sectionNr];
			ctx.strokeStyle = 'transparent';
			if(p[i].number==Game.current){
				ctx.fillStyle = '#9c832b';
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
		}
	};
	drawPlayer();
}
