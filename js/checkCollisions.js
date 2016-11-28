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
		}
		var tab=new Array();
		var indexOnPlatform=null;
		for(var i=0;i<Game.onPlatform.length;i++){
			if(Game.onPlatform[i]==true){
				tab.push(i)
				indexOnPlatform=i;
			}
			Game.onPlatform[i]=false;
		}
		if(tab.length==2){
			if(p[tab[0]].height+p[tab[0]].y<p[tab[1]].height+p[tab[1]].y){
				indexOnPlatform=tab[1]
			}else if(p[tab[0]].height+p[tab[0]].y>=p[tab[1]].height+p[tab[1]].y){
				indexOnPlatform=tab[0];
			}
		}
		if(indexOnPlatform>=0)
			Game.onPlatform[indexOnPlatform]=true;

		indexOnPlatform=Game.onPlatform.indexOf(true);
		if(indexOnPlatform >= 0){
			if(Game.platforms[indexOnPlatform].number > Game.score){
				Game.score=Game.platforms[indexOnPlatform].number;
			}
			Game.current=Game.platforms[indexOnPlatform].number;
			if(Game.score>5){
				Game.fallingPlatforms=true;
			}
			var stopPosY = p[indexOnPlatform].y + p[indexOnPlatform].height;
		}else{
			var stopPosY = 0;
		}
		if(!playerAction.jumped
		 && Player.y > stopPosY
		 && !playerAction.fallout){
			playerAction.fallout=true;
			playerAction.jumpDOWN();
			playerAction.fallout=false;
		}
	}
}
