var Game = {
	minYpos:25,
	onPlatform:new Array(),
	frontOfPlatgorm:new Array(),
	behindOfPlatgorm:new Array(),
	gameLoop:null,
	platforms:[
			{attribute:'scaffolding',width:40,height:5,x:290,y:90},
			{attribute:'scaffolding',width:40,height:5,x:290,y:140},
			{attribute:'scaffolding',width:40,height:5,x:290,y:190},
			{attribute:'scaffolding',width:40,height:5,x:290,y:240},
			{attribute:'scaffolding',width:40,height:5,x:290,y:290},
			{attribute:'wall',width:20,height:300,x:350,y:25},
			{attribute:'scaffolding',width:40,height:5,x:390,y:90},
			{attribute:'scaffolding',width:40,height:5,x:390,y:140},
			{attribute:'scaffolding',width:40,height:5,x:390,y:190},
			{attribute:'scaffolding',width:40,height:5,x:390,y:240},
			{attribute:'scaffolding',width:40,height:5,x:390,y:290},
		],
	startGame: function(){
		playerAction.playerI = 0;
		playerAction.jumped = false;
		playerAction.jumpI=0;
		Game.setPlayer();
		Game.gameLoop = setInterval(loop, 3);
	},
	setPlayer:function(){
		Player.x = 5;
		Player.y = Game.minYpos;
		Player.lives = 100;
	},
	finish:function(){
		clearInterval(Game.gameLoop);
		Game.startGame();
	}
};
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var Player = {
	direction: 'right',
	step : 2,
	maxJump : 80,
	x : 5,
	y : Game.minYpos,
	width : 20,
	height : 60
}

function loop(){
	checkCollisions.checkPlatformsEnd();

	if(keys.left) playerAction.moveLeft();
	if(keys.right) playerAction.moveRight();
	if(keys.space) playerAction.jump();
	if(!keys.left && !keys.right) playerAction.playerI = 0;

	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	drawView();
}

Game.startGame();