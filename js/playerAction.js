export const Player = {
    step: 190,
    jumpVelocity: 430,
    boostJumpVelocity: 570,
    x: 0,
    y: 0,
    previousY: 0,
    velocityY: 0,
    width: 22,
    height: 44,
    color: '#39c7d4',
    facing: 1,
    grounded: false,
    landingPulse: 0,
};

export const playerAction = {
    playerI: 0,
    jumped: false,
    allowJump: true,
    fallout: false,
    jumpBack: false,
    jumpEvent: null,
    jumpI: 0,
    reset: function () {
        this.playerI = 0;
        this.jumped = false;
        this.allowJump = true;
        this.fallout = false;
        this.jumpBack = false;
        this.jumpI = 0;
        this.jumpEvent = null;
        Player.velocityY = 0;
        Player.grounded = true;
        Player.landingPulse = 0;
    },
    moveLeft: function (dt) {
        Player.facing = -1;
        this.playerI = this.playerI < 20 ? this.playerI + 46 * dt : -20;
        Player.x = Math.max(0, Player.x - Player.step * dt);
    },
    moveRight: function (dt, Game) {
        Player.facing = 1;
        this.playerI = this.playerI < 20 ? this.playerI + 46 * dt : -20;
        Player.x = Math.min(Game.getWidth() - Player.width, Player.x + Player.step * dt);
    },
    jump: function (boost, Game) {
        if (Player.grounded && this.allowJump && Game.isStarted) {
            Player.velocityY = boost ? Player.boostJumpVelocity : Player.jumpVelocity;
            Player.grounded = false;
            this.jumped = true;
            this.jumpBack = false;
        }
    },
    update: function (dt, Game, keys) {
        if (Player.grounded) {
            Game.syncGroundedPlayer();
        }
        if (keys.left) {
            this.moveLeft(dt);
        }
        if (keys.right) {
            this.moveRight(dt, Game);
        }
        if (!keys.left && !keys.right) {
            this.playerI *= Math.max(0, 1 - 10 * dt);
            if (Math.abs(this.playerI) < 0.2) {
                this.playerI = 0;
            }
        }
        if (keys.space) {
            this.jump(false, Game);
        }

        Player.previousY = Player.y;
        if (Player.grounded) {
            Player.velocityY = 0;
        } else {
            Player.velocityY -= Game.gravity * dt;
            Player.y += Player.velocityY * dt;
        }
        Player.landingPulse = Math.max(0, Player.landingPulse - dt * 5);

        this.jumped = !Player.grounded;
        this.fallout = Player.velocityY < 0 && !Player.grounded;
        this.jumpBack = Player.velocityY < 0;
    },
    landOn: function (platform, Game) {
        Player.y = platform.y + platform.height;
        Player.velocityY = 0;
        Player.grounded = true;
        Player.landingPulse = 1;
        this.jumped = false;
        this.fallout = false;
        this.allowJump = true;
        if (platform.type === 'spring') {
            this.jump(true, Game);
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#6ee7b7', 16);
        } else {
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
        }
    },
    jumpUP: function () {
    },
    jumpDOWN: function () {
    },
};
