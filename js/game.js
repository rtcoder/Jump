import { checkCollisions } from './checkCollisions.js?v=module-6';
import { getRandomInt, resizeCanvas } from './customFunctions.js?v=module-6';
import { drawView } from './drawing.js?v=module-6';
import { keys } from './keys.js?v=module-6';
import { Player, playerAction } from './playerAction.js?v=module-6';

export const Game = {
    canvas: null,
    ctx: null,
    platformVerticalDistance: 72,
    isStarted: false,
    isOver: false,
    fallingPlatforms: false,
    onPlatform: [],
    animationFrame: null,
    lastFrameTime: 0,
    current: 0,
    score: 0,
    bestScore: 0,
    bestScoreKey: 'jump-best-score',
    gravity: 920,
    cameraY: 0,
    cameraEase: 7,
    platforms: [],
    particles: [],
    newRecordShown: false,
    colors: {
        normal: '#e14f62',
        moving: '#4bc0ff',
        shrink: '#ffbf4d',
        spring: '#6ee7b7',
        crumble: '#d7a86e',
        ice: '#b8f7ff',
        boost: '#a78bfa',
        vertical: '#fb7185',
        conveyor: '#34d399',
        checkpoint: '#f4d35e',
        current: '#fff3a3',
    },
    getWidth: function () {
        return Game.canvas.logicalWidth || Game.canvas.width;
    },
    getHeight: function () {
        return Game.canvas.logicalHeight || Game.canvas.height;
    },
    worldToScreenY: function (y, height = 0) {
        return Game.getHeight() - (y - Game.cameraY) - height;
    },
    loadBestScore: function () {
        try {
            const value = parseInt(localStorage.getItem(Game.bestScoreKey), 10);
            Game.bestScore = isNaN(value) ? 0 : value;
        } catch (e) {
            Game.bestScore = 0;
        }
        Game.updateHud();
    },
    saveBestScore: function () {
        if (Game.score > Game.bestScore) {
            Game.bestScore = Game.score;
            try {
                localStorage.setItem(Game.bestScoreKey, Game.bestScore);
            } catch (e) {
            }
            if (Game.isStarted && !Game.newRecordShown) {
                Game.addParticles(Game.getWidth() / 2, Game.getHeight() - 80, '#f4d35e', 26);
                Game.newRecordShown = true;
            }
        }
    },
    startGame: function () {
        Game.stopLoop();
        Game.isStarted = true;
        Game.isOver = false;
        Game.fallingPlatforms = false;
        Game.platforms = [];
        Game.onPlatform = [];
        Game.particles = [];
        Game.current = 0;
        Game.score = 0;
        Game.cameraY = 0;
        Game.newRecordShown = false;
        playerAction.reset();
        Game.generatePlatforms(110);
        Game.setPlayer();
        Game.updateHud();
        Game.setOverlay('hidden');
        Game.lastFrameTime = 0;
        Game.animationFrame = requestAnimationFrame(Game.loop);
    },
    stopLoop: function () {
        if (Game.animationFrame) {
            cancelAnimationFrame(Game.animationFrame);
            Game.animationFrame = null;
        }
    },
    setPlayer: function () {
        const firstPlatform = Game.platforms[0];
        Player.x = Math.max(8, Game.getWidth() * 0.16);
        Player.y = firstPlatform ? firstPlatform.y + firstPlatform.height : 24;
        Player.previousY = Player.y;
        Player.velocityY = 0;
        Player.grounded = true;
    },
    finish: function () {
        if (Game.isOver) {
            return;
        }
        Game.stopLoop();
        Game.isStarted = false;
        Game.isOver = true;
        Game.saveBestScore();
        Game.showScore();
    },
    setOverlay: function (className) {
        document.getElementById('mask').className = className;
        document.getElementById('game-shell').classList.toggle('is-playing', className === 'hidden');
    },
    showScore: function () {
        const scoreDiv = document.getElementById('score');
        scoreDiv.innerHTML = `<span>Score</span><strong>${Game.score}</strong><small>Best ${Game.bestScore}</small>`;
        Game.setOverlay('showScore');
        Game.updateHud();
    },
    updateHud: function () {
        document.getElementById('hud-score-value').innerHTML = Game.score;
        document.getElementById('hud-best-value').innerHTML = Game.bestScore;
        document.getElementById('best-score').innerHTML = Game.bestScore;
    },
    loop: function (timestamp) {
        if (!Game.isStarted) {
            return;
        }
        if (!Game.lastFrameTime) {
            Game.lastFrameTime = timestamp;
        }
        const dt = Math.min((timestamp - Game.lastFrameTime) / 1000, 0.033);
        Game.lastFrameTime = timestamp;
        Game.update(dt);
        Game.draw();
        Game.animationFrame = requestAnimationFrame(Game.loop);
    },
    update: function (dt) {
        Game.movePlatforms(dt);
        playerAction.update(dt, Game, keys);
        checkCollisions.checkPlatformsEnd(Game, Player, playerAction);
        Game.updateCamera(dt);
        Game.updateParticles(dt);
        Game.saveBestScore();
        Game.updateHud();
        if (Game.worldToScreenY(Player.y, Player.height) > Game.getHeight() + 50) {
            Game.finish();
        }
    },
    draw: function () {
        Game.ctx.clearRect(0, 0, Game.getWidth(), Game.getHeight());
        drawView(Game.ctx, Game, Player, playerAction);
    },
    movePlatforms: function (dt) {
        if (Game.score > 5) {
            Game.fallingPlatforms = true;
        }
        const sectionNr = Math.floor(Game.score / 100);
        const fallSpeed = Game.fallingPlatforms ? 34 + sectionNr * 12 : 0;
        for (let i = 0; i < Game.platforms.length; i++) {
            const p = Game.platforms[i];
            p.y -= fallSpeed * dt;
            if (p.type === 'moving') {
                p.x += p.direction * p.speed * dt;
                if (p.x <= 0) {
                    p.x = 0;
                    p.direction = 1;
                }
                if (p.x + p.width >= Game.getWidth()) {
                    p.x = Game.getWidth() - p.width;
                    p.direction = -1;
                }
            }
            if (p.type === 'shrink') {
                p.width += p.resizeDirection * p.resizeSpeed * dt;
                if (p.width <= p.minWidth) {
                    p.width = p.minWidth;
                    p.resizeDirection = 1;
                }
                if (p.width >= p.maxWidth) {
                    p.width = p.maxWidth;
                    p.resizeDirection = -1;
                }
                p.x = Math.max(0, Math.min(Game.getWidth() - p.width, p.centerX - p.width / 2));
            }
            if (p.type === 'crumble' && p.crumbling) {
                p.crumbleTimer -= dt;
            }
            if (p.type === 'vertical') {
                const oldOffset = p.verticalOffset;
                p.verticalOffset += p.verticalDirection * p.verticalSpeed * dt;
                if (p.verticalOffset > p.verticalRange) {
                    p.verticalOffset = p.verticalRange;
                    p.verticalDirection = -1;
                }
                if (p.verticalOffset < -p.verticalRange) {
                    p.verticalOffset = -p.verticalRange;
                    p.verticalDirection = 1;
                }
                p.y += p.verticalOffset - oldOffset;
            }
        }
        Game.platforms = Game.platforms.filter((platform) => {
            const stillAboveScreen = platform.y + platform.height > -20;
            const stillSolid = platform.type !== 'crumble' || !platform.crumbling || platform.crumbleTimer > 0;
            return stillAboveScreen && stillSolid;
        });
        if (Game.platforms.length <= 24) {
            Game.generatePlatforms(80);
        }
    },
    generatePlatforms: function (count) {
        let y = 0;
        let number = 0;
        if (Game.platforms.length > 0) {
            const last = Game.platforms[Game.platforms.length - 1];
            y = last.y + Game.platformVerticalDistance;
            number = last.number + 1;
        }
        for (let i = 0; i < count; i++) {
            const width = getRandomInt(Math.floor(Game.getWidth() * 0.28), Math.floor(Game.getWidth() * 0.52));
            const platform = {
                width: width,
                maxWidth: width,
                minWidth: Math.max(56, Math.floor(width * 0.45)),
                height: 10,
                x: getRandomInt(8, Math.max(8, Math.floor(Game.getWidth() - width - 8))),
                y: y,
                number: number,
                type: 'normal',
                direction: Math.random() > 0.5 ? 1 : -1,
                speed: 54 + Math.floor(number / 30) * 6,
                resizeDirection: -1,
                resizeSpeed: 38,
                crumbling: false,
                crumbleTimer: 0,
                crumbleDuration: 0.72,
                used: false,
                verticalOffset: 0,
                verticalRange: 24,
                verticalSpeed: 42,
                verticalDirection: Math.random() > 0.5 ? 1 : -1,
                conveyorDirection: Math.random() > 0.5 ? 1 : -1,
                conveyorSpeed: 82,
            };
            platform.centerX = platform.x + platform.width / 2;
            if (number % 100 === 0) {
                platform.width = Game.getWidth();
                platform.maxWidth = platform.width;
                platform.minWidth = platform.width;
                platform.x = 0;
                platform.centerX = Game.getWidth() / 2;
                platform.height = 18;
                platform.type = 'checkpoint';
            } else if (number > 0 && number % 23 === 0) {
                platform.type = 'spring';
                platform.height = 12;
            } else if (number > 10 && number % 29 === 0) {
                platform.type = 'boost';
                platform.height = 12;
            } else if (number > 6 && number % 19 === 0) {
                platform.type = 'ice';
                platform.height = 9;
            } else if (number > 14 && number % 31 === 0) {
                platform.type = 'vertical';
                platform.height = 10;
                platform.verticalRange = 26;
                platform.verticalSpeed = 48;
            } else if (number > 14 && number % 37 === 0) {
                platform.type = 'conveyor';
                platform.height = 11;
            } else if (number > 8 && number % 11 === 0) {
                platform.type = 'crumble';
                platform.height = 11;
            } else if ((number % 15 === 0 || number % 17 === 0) && number > 0) {
                platform.type = 'moving';
            } else if (number % 13 === 0 && number > 0) {
                platform.type = 'shrink';
            }
            Game.platforms.push(platform);
            y += Game.platformVerticalDistance;
            number++;
        }
    },
    updateCurrentPlatform: function (platform) {
        Game.onPlatform = [];
        if (platform) {
            Game.current = platform.number;
            if (platform.number > Game.score) {
                Game.score = platform.number;
            }
        }
    },
    updateCamera: function (dt) {
        const playerTop = Game.worldToScreenY(Player.y, Player.height);
        const topComfortLine = Game.getHeight() * 0.28;
        const targetCameraY = Math.max(
            Game.cameraY,
            Player.y + Player.height + topComfortLine - Game.getHeight()
        );
        if (playerTop < topComfortLine || targetCameraY > Game.cameraY) {
            const follow = Math.min(1, Game.cameraEase * dt);
            Game.cameraY += (targetCameraY - Game.cameraY) * follow;
        }
    },
    syncGroundedPlayer: function (dt) {
        let platform = null;
        for (let i = 0; i < Game.platforms.length; i++) {
            if (Game.platforms[i].number === Game.current) {
                platform = Game.platforms[i];
                break;
            }
        }
        if (!platform) {
            Player.grounded = false;
            return;
        }
        const horizontalOverlap = Player.x + Player.width > platform.x + 4 &&
            Player.x < platform.x + platform.width - 4;
        if (horizontalOverlap) {
            if (platform.type === 'conveyor') {
                Player.x = Math.max(0, Math.min(
                    Game.getWidth() - Player.width,
                    Player.x + platform.conveyorDirection * platform.conveyorSpeed * dt
                ));
            }
            Player.y = platform.y + platform.height;
            Player.previousY = Player.y;
        } else {
            Player.grounded = false;
        }
    },
    addParticles: function (x, y, color, count) {
        for (let i = 0; i < count; i++) {
            Game.particles.push({
                x: x,
                y: y,
                vx: getRandomInt(-70, 70),
                vy: getRandomInt(30, 130),
                life: 0.55,
                maxLife: 0.55,
                color: color,
            });
        }
    },
    updateParticles: function (dt) {
        for (let i = 0; i < Game.particles.length; i++) {
            const particle = Game.particles[i];
            particle.life -= dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy -= 260 * dt;
        }
        Game.particles = Game.particles.filter((particle) => particle.life > 0);
    },
    handleResize: function () {
        const oldWidth = Game.getWidth();
        resizeCanvas(Game.canvas, Game.ctx);
        const newWidth = Game.getWidth();
        if (oldWidth && newWidth !== oldWidth) {
            const scale = newWidth / oldWidth;
            Player.x *= scale;
            for (let i = 0; i < Game.platforms.length; i++) {
                Game.platforms[i].x *= scale;
                Game.platforms[i].width *= scale;
                Game.platforms[i].maxWidth *= scale;
                Game.platforms[i].minWidth *= scale;
                Game.platforms[i].centerX *= scale;
            }
        }
        Game.draw();
    },
};

export function initGame(canvas, ctx) {
    Game.canvas = canvas;
    Game.ctx = ctx;
    resizeCanvas(Game.canvas, Game.ctx);
    Game.loadBestScore();
    Game.draw();
}
