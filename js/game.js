var Game = {
	platformVerticalDistance:70,
	isStarted:false,
	fallingPlatforms:false,
	onPlatform:new Array(),
	gameLoop:null,
	current:0,
	score:0,
	platforms:new Array(),
	startGame: function(){
		var mask = document.getElementById('mask').className = 'hidden';

		Game.fallingPlatforms=false;
		Game.isStarted=true;
		Game.platforms = new Array();
		Game.current = 0;
		Game.score = 0;
		playerAction.playerI = 0;
		playerAction.jumped = false;
		playerAction.jumpI=0;

		Game.generatePlatofrms(100);
		Game.setPlayer();
		Game.gameLoop = setInterval(loop, 3);
	},
	setPlayer:function(){
		Player.x = 5;
		Player.y = 30;
	},
	finish:function(){
		clearInterval(Game.gameLoop);
		Game.isStarted=false;
		Game.showScore();

	},
	showScore:function(){
		var mask = document.getElementById('mask').className = 'showScore';
		var scoreDiv = document.getElementById('score').innerHTML = Game.score;
	},
	generatePlatofrms: function (count) {
		var y=0;
		var number = 0;
		if(Game.platforms.length > 0){
			y = Game.platforms[Game.platforms.length -1].y+Game.platformVerticalDistance;
			number = Game.platforms[Game.platforms.length -1].number+1;
		}

		for(var i = 0; i<count; i++){
			var w = getRandomInt(canvas.width/4, canvas.width/2);
			var p = {
				width:w,
				height:5,
				x:getRandomInt(0, canvas.width-w),
				y:y,
				number:number,
				move:false,
				moveBack:false
			};
			if(number%100==0){
				p.width = canvas.width;
				p.x=0;
				p.height=20;
			}

			if(number%15==0){
				p.move = true;
			}

			Game.platforms.push(p);
			y = y+Game.platformVerticalDistance;
			number++;
		}
	}
};
function loop(){
	checkCollisions.checkPlatformsEnd();

	if(keys.left) playerAction.moveLeft();
	if(keys.right) playerAction.moveRight();
	if(keys.space){
		playerAction.jump();
		if(!Game.isStarted){
			Game.isStarted=true;
		}
	}
	if(!keys.left && !keys.right) playerAction.playerI = 0;

	ctx.clearRect(0,0,canvas.width,canvas.height);

	drawView();
}

// Game.startGame();
