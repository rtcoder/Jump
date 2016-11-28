var Game = {
	isStarted:false,
	onPlatform:new Array(),
	gameLoop:null,
	platforms:[],
	startGame: function(){
		Game.platforms = [];
		var y=0;
		for(var i = 0; i<100; i++){
			var w = getRandomInt(canvas.width/4, canvas.width/2);
			var p = {
				width:w,
				height:5,
				x:getRandomInt(0, canvas.width-w),
				y:y
			};
			if(i%10==0){
				p.width = canvas.width;
				p.x=0;
				p.height=15;
			}
			Game.platforms.push(p);
			y = y+60;
		}


		playerAction.playerI = 0;
		playerAction.jumped = false;
		playerAction.jumpI=0;
		Game.setPlayer();
		Game.gameLoop = setInterval(loop, 3);
	},
	setPlayer:function(){
		Player.x = 5;
		Player.y = 20;
		Player.lives = 100;
	},
	finish:function(){
		clearInterval(Game.gameLoop);
		Game.isStarted=false;
		Game.startGame();
	}
};
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var Player = {
	step : 2,
	maxJump : 80,
	x : 5,
	y : 10,
	width : 20,
	height : 60
}

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

Game.startGame();