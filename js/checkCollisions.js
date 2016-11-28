var checkCollisions = {
	checkPlatformsEnd:function(){
		var p = Game.platforms;
		for(var i=0;i<p.length;i++){
			if(Player.x+Player.width>=p[i].x
			 && Player.x<=p[i].x+p[i].width
			 && Player.y>=p[i].y+p[i].height){
				Game.onPlatform[i]=true;
			}else{
				Game.onPlatform[i]=false;
			}
			if(Player.x+Player.width>=p[i].x-3
			 && Player.x+Player.width<p[i].x+p[i].width
			 && Player.y<p[i].y+p[i].height
			 && Player.y+Player.height>p[i].y){
				Game.frontOfPlatgorm[i]=true;
			}else{
				Game.frontOfPlatgorm[i]=false;
			}
			if(Player.x<=p[i].x+p[i].width+3
			 && Player.x>p[i].x
			 && Player.y<p[i].y+p[i].height
			 && Player.y+Player.height>p[i].y){
				Game.behindOfPlatgorm[i]=true;
			}else{
				Game.behindOfPlatgorm[i]=false;
			}
		}
		if(Game.frontOfPlatgorm.indexOf(true)>=0 && !playerAction.jumped){
			playerAction.allowMoveRight=false;
		}else{
			playerAction.allowMoveRight=true;
		}
		if(Game.behindOfPlatgorm.indexOf(true)>=0 && !playerAction.jumped){
			playerAction.allowMoveLeft=false;
		}else{
			playerAction.allowMoveLeft=true;
		}
		var tab=new Array();
		var indexOnPlatform=-1;
		for(var i=0;i<Game.onPlatform.length;i++){
			if(Game.onPlatform[i]==true){
				tab.push(i)
				indexOnPlatform=i
			}
			Game.onPlatform[i]=false
		}
		if(tab.length==2){
			if(p[tab[0]].height+p[tab[0]].y<p[tab[1]].height+p[tab[1]].y){
				indexOnPlatform=tab[1]
			}else if(p[tab[0]].height+p[tab[0]].y>=p[tab[1]].height+p[tab[1]].y){
				indexOnPlatform=tab[0]
			}
		}
		if(indexOnPlatform>=0)
			Game.onPlatform[indexOnPlatform]=true

		indexOnPlatform=Game.onPlatform.indexOf(true);
		if(indexOnPlatform >= 0){
			var stopPosY = p[indexOnPlatform].y + p[indexOnPlatform].height;
		}else{
			var stopPosY = Game.minYpos;
		}
		if(!playerAction.jumped
		 && Player.y > stopPosY
		 && !playerAction.fallout){
			playerAction.fallout=true
			playerAction.jumpDOWN();
			playerAction.fallout=false;
		}
	}
}