var Game = {
	platformVerticalDistance:70,
	isStarted:false,
	fallingPlatforms:false,
	onPlatform:new Array(),
	gameLoop:null,
	current:0,
	score:0,
	colors:[
		'#a52a2a',
		'#2b9c5a',
		'#492b9c',
		'#872b9c',
		'#799c2b',
		'#2b9c55'
	],
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
	movePlatforms:function(){
		var p = Game.platforms;
		var platformsToDelete=[];
		for (var i = 0; i < p.length; i++) {
			if(Game.fallingPlatforms){
				var sectionNr = Math.floor(Game.score/100);
				p[i].y-=0.2+sectionNr/10;
			}
			if(canvas.height-p[i].y > 0){
				if(p[i].move){
					if(p[i].moveBack){
						p[i].x--;
						if(p[i].x<0){
							p[i].moveBack=false;
						}
					}else{
						p[i].x++;
						if(p[i].x+p[i].width>canvas.width){
							p[i].moveBack=true;
						}
					}
				}
				if(p[i].resize){
					if(p[i].resizeBack){
						p[i].x+=0.5;
						p[i].width-=1;
						if(p[i].width<0){
							p[i].resizeBack=false;
						}
					}else{
						p[i].x-=0.5;
						p[i].width+=1;
						if(p[i].width>=p[i].maxWidth){
							p[i].resizeBack=true;
						}
					}
				}
				if(p[i].y+p[i].height < 0){
					platformsToDelete.push(i);
				}
			}
		}

		if(platformsToDelete.length > 0){
			for (var i = 0; i < platformsToDelete.length; i++) {
				Game.platforms.splice(platformsToDelete[i],1);
			}
		}

		if(Game.platforms.length <= 20){
			Game.generatePlatofrms(100);
		}
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
			var x = getRandomInt(0, canvas.width - w);
			var p = {
				width:w,
				maxWidth:w,
				height:5,
				x:x,
				y:y,
				number:number,
				move:false,
				moveBack:false,
				resize:false,
				resizeBack:false
			};
			if(number%100==0){
				p.width = canvas.width;
				p.x=0;
				p.height=20;
			}

			if((number%15==0 || number%17==0) && number%100!=0){
				p.move = true;
			}else if(number%13==0 && number%100!=0){
				p.resize = true;
			}

			Game.platforms.push(p);
			y = y+Game.platformVerticalDistance;
			number++;
		}
	}
};
function loop(){
	checkCollisions.checkPlatformsEnd();
	Game.movePlatforms();
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
// Game.r()
// Game.startGame();
