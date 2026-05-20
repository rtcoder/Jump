export const checkCollisions = {
    checkPlatformsEnd: function (Game, Player, playerAction) {
        let landedPlatform = null;
        if (!Player.grounded && Player.velocityY <= 0) {
            for (let i = 0; i < Game.platforms.length; i++) {
                const platform = Game.platforms[i];
                if (!Game.isPlatformSolid(platform)) {
                    continue;
                }
                const platformTop = platform.y + platform.height;
                const horizontalOverlap = Player.x + Player.width > platform.x + 4 &&
                    Player.x < platform.x + platform.width - 4;
                const crossedFromAbove = Player.previousY >= platformTop &&
                    Player.y <= platformTop;
                if (horizontalOverlap && crossedFromAbove) {
                    if (!landedPlatform || platformTop > landedPlatform.y + landedPlatform.height) {
                        landedPlatform = platform;
                    }
                }
            }
        }
        if (landedPlatform) {
            playerAction.landOn(landedPlatform, Game);
            Game.updateCurrentPlatform(landedPlatform);
        } else if (!Player.grounded && Player.y > 0) {
            Player.grounded = false;
        }
    },
};
