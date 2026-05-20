export const Player = {
    step: 190,
    jumpVelocity: 430,
    boostJumpVelocity: 570,
    megaBoostJumpVelocity: 690,
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
    slideVelocityX: 0,
    iceTimer: 0,
    shield: false,
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
        Player.slideVelocityX = 0;
        Player.iceTimer = 0;
        Player.shield = false;
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
            Game.syncGroundedPlayer(dt);
        }
        if (keys.left) {
            this.moveLeft(dt);
        }
        if (keys.right) {
            this.moveRight(dt, Game);
        }
        if (Player.iceTimer > 0) {
            Player.x = Math.max(0, Math.min(
                Game.getWidth() - Player.width,
                Player.x + Player.slideVelocityX * dt
            ));
            Player.slideVelocityX *= Math.max(0, 1 - 1.7 * dt);
            Player.iceTimer = Math.max(0, Player.iceTimer - dt);
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
        } else if (platform.type === 'checkpoint') {
            Player.shield = true;
            Player.iceTimer = 0;
            Player.slideVelocityX = 0;
            Game.slowMotionTimer = platform.checkpointSlowDuration;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#f4d35e', platform.used ? 12 : 30);
            platform.used = true;
        } else if (platform.type === 'boost') {
            if (!platform.used) {
                platform.used = true;
                Player.velocityY = Player.megaBoostJumpVelocity;
                Player.grounded = false;
                this.jumped = true;
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#b8f7ff', 28);
            } else {
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
            }
        } else if (platform.type === 'ice') {
            Player.iceTimer = 0.9;
            Player.slideVelocityX = (Player.facing || 1) * 78;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#b8f7ff', 10);
        } else if (platform.type === 'swing') {
            Player.iceTimer = 0.55;
            Player.slideVelocityX = platform.swingForce * platform.swingImpulse;
            Player.facing = Player.slideVelocityX >= 0 ? 1 : -1;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#f472b6', 12);
        } else if (platform.type === 'rotate') {
            Player.iceTimer = 0.32;
            Player.slideVelocityX = Math.sin(platform.rotationAngle) * platform.rotationSlide;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#f59e0b', 10);
        } else if (platform.type === 'spike') {
            const footCenter = Player.x + Player.width / 2;
            const safeStart = platform.x + platform.width * platform.spikeSafeStart;
            const safeEnd = platform.x + platform.width * platform.spikeSafeEnd;
            if (footCenter < safeStart || footCenter > safeEnd) {
                if (Player.shield) {
                    Player.shield = false;
                    Player.velocityY = Player.boostJumpVelocity * 0.82;
                    Player.grounded = false;
                    this.jumped = true;
                    Game.addParticles(Player.x + Player.width / 2, Player.y, '#81e6d9', 30);
                } else {
                    Game.addParticles(Player.x + Player.width / 2, Player.y, '#ef4444', 28);
                    Game.resetCombo();
                    Game.finish();
                }
            } else {
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
            }
        } else if (platform.type === 'mine') {
            if (!platform.used) {
                const playerCenter = Player.x + Player.width / 2;
                const platformCenter = platform.x + platform.width / 2;
                const direction = playerCenter >= platformCenter ? 1 : -1;
                platform.used = true;
                Player.velocityY = platform.mineForceY;
                Player.grounded = false;
                Player.iceTimer = 0.42;
                Player.slideVelocityX = direction * platform.mineForceX;
                Player.facing = direction;
                this.jumped = true;
                Game.addParticles(platformCenter, platform.y + platform.height, '#fb923c', 36);
            } else {
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
            }
        } else if (platform.type === 'magnet') {
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#22d3ee', 12);
        } else if (platform.type === 'slow') {
            Game.slowMotionTimer = platform.slowDuration;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#818cf8', 22);
        } else if (platform.type === 'hot') {
            platform.hotTimer = platform.hotDuration;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#f97316', 12);
        } else if (platform.type === 'thin') {
            if (!platform.used) {
                platform.used = true;
                Game.score = Math.max(Game.score, platform.number + platform.thinBonus);
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#facc15', 20);
            } else {
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
            }
        } else if (platform.type === 'fake') {
            platform.used = true;
            Game.resetCombo();
            Player.grounded = false;
            Player.velocityY = Math.min(Player.velocityY, -120);
            this.jumped = true;
            this.fallout = true;
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#fca5a5', 24);
        } else if (platform.type === 'shield') {
            if (!platform.used) {
                platform.used = true;
                Player.shield = true;
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#81e6d9', 24);
            } else {
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
            }
        } else if (platform.type === 'crumble') {
            if (!platform.crumbling) {
                platform.crumbling = true;
                platform.crumbleTimer = platform.crumbleDuration;
                Game.addParticles(Player.x + Player.width / 2, Player.y, '#d7a86e', 14);
            }
        } else {
            Game.addParticles(Player.x + Player.width / 2, Player.y, '#f8fafc', 7);
        }
    },
    jumpUP: function () {
    },
    jumpDOWN: function () {
    },
};
