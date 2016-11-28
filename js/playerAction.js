var playerAction={
	playerI:0,
	jumped :false,
	allowMoveLeft:true,
	allowMoveRight:true,
	allowJump:true,
	fallout:false,
	jumpBack:false,
	jumpEvent:null,
	jumpI:0,
	jumpUP:function(){
		playerAction.jumpI+=2;;
		Player.y+=2;
		var point = {
			x:Player.x,
			y:Player.y,
			width:Player.width,
			height:Player.height
		}
		if(playerAction.jumpI>=Player.maxJump)
			playerAction.jumpBack=true
	},
	jumpDOWN:function(){
		playerAction.fallout=true;
		playerAction.allowJump = false;
		Player.y-=2;
		playerAction.jumpI=0;
		var p = Game.platforms;

		if(Game.onPlatform.indexOf(true)<0){
			var j=Game.minYpos;
		}else{
			var j=p[Game.onPlatform.indexOf(true)].y + p[Game.onPlatform.indexOf(true)].height;
		}
		if(Game.maxJump+Player.y-Player.height<j){
			var j=playerAction.oldYplayerPos
		}
		if(Player.y<=j){
			Player.y=j
			clearInterval(playerAction.jumpEvent)
			playerAction.jumped=false;
			playerAction.fallout=false;
			playerAction.allowJump = true;
		}
	},
	jump:function(){
		if(!playerAction.jumped && playerAction.allowJump && !playerAction.fallout){
			playerAction.jumped=true;
			playerAction.oldYplayerPos=Player.y;
			playerAction.jumpBack=false
			playerAction.jumpEvent = setInterval(function(){
				if(!Game.isPaused){
					if(!playerAction.jumpBack){
						playerAction.jumpUP()
					}else{
						playerAction.jumpDOWN()
					}
				}
			},3)
		}
	},
	moveLeft: function(){
		Player.direction = 'left';
		if(playerAction.allowMoveLeft){
			var step = Player.step;
			
			if(playerAction.playerI < 20){
				playerAction.playerI+=0.7;
			}else{
				playerAction.playerI = -20;
			}
			if(Player.x>=step){
				Player.x-=step;
			}
		}
	},
	moveRight: function(){
		Player.direction = 'right';
		if(playerAction.allowMoveRight){
			var step = Player.step;

			if(playerAction.playerI < 20){
				playerAction.playerI+=0.7;
			}else{
				playerAction.playerI = -20;
			}
			if(Player.x <= canvas.width - Player.width - step){
				Player.x+=step;
			}
		}
	}
}