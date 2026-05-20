import { checkCollisions } from './checkCollisions.js?v=module-20';
import { getRandomInt, resizeCanvas } from './customFunctions.js?v=module-20';
import { drawView } from './drawing.js?v=module-20';
import { keys } from './keys.js?v=module-20';
import { Player, playerAction } from './playerAction.js?v=module-20';

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
    platformBufferScreens: 2.2,
    platforms: [],
    particles: [],
    newRecordShown: false,
    slowMotionTimer: 0,
    slowMotionFactor: 0.48,
    comboCount: 0,
    comboMultiplier: 1,
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
        vanish: '#c084fc',
        shield: '#81e6d9',
        swing: '#f472b6',
        teleport: '#60a5fa',
        rotate: '#f59e0b',
        spike: '#ef4444',
        mine: '#111827',
        magnet: '#22d3ee',
        slow: '#818cf8',
        hot: '#f97316',
        thin: '#facc15',
        fake: '#e14f62',
        coin: '#fbbf24',
        combo: '#ec4899',
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
    isPlatformSolid: function (platform) {
        if (platform.type === 'fake' && platform.used) {
            return false;
        }
        return platform.type !== 'vanish' || platform.vanishActive;
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
        Game.slowMotionTimer = 0;
        Game.resetCombo();
        playerAction.reset();
        Game.generatePlatforms(120);
        Game.setPlayer();
        Game.ensurePlatformBuffer();
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
        document.getElementById('hud-shield-value').innerHTML = Player.shield ? 'On' : 'Off';
        document.getElementById('hud-shield').classList.toggle('is-active', Player.shield);
        document.getElementById('hud-combo-value').innerHTML = `x${Game.comboMultiplier}`;
        document.getElementById('hud-combo').classList.toggle('is-active', Game.comboMultiplier > 1);
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
        const gameplayDt = Game.slowMotionTimer > 0 ? dt * Game.slowMotionFactor : dt;
        Game.slowMotionTimer = Math.max(0, Game.slowMotionTimer - dt);
        Game.movePlatforms(gameplayDt);
        Game.ensurePlatformBuffer();
        Game.applyMagnetForces(gameplayDt);
        playerAction.update(gameplayDt, Game, keys);
        checkCollisions.checkPlatformsEnd(Game, Player, playerAction);
        Game.updateCamera(dt);
        Game.updateParticles(dt);
        Game.saveBestScore();
        Game.updateHud();
        if (Game.worldToScreenY(Player.y, Player.height) > Game.getHeight() + 50) {
            Game.handleFallout();
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
            if (p.baseY !== undefined) {
                p.baseY -= fallSpeed * dt;
            }
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
            if (p.type === 'swing') {
                p.swingTime += dt;
                p.x = p.baseX;
                p.y = p.baseY;
                p.swingForce = Math.sin(p.swingTime * p.swingSpeed);
                p.deltaX = 0;
                p.deltaY = 0;
            } else {
                p.deltaX = 0;
                p.deltaY = 0;
            }
            if (p.type === 'teleport') {
                p.teleportTimer -= dt;
                if (p.teleportTimer <= 0) {
                    const oldX = p.x;
                    p.x = getRandomInt(8, Math.max(8, Math.floor(Game.getWidth() - p.width - 8)));
                    p.centerX = p.x + p.width / 2;
                    p.teleportTimer = p.teleportInterval;
                    p.deltaX = p.x - oldX;
                    Game.addParticles(p.x + p.width / 2, p.y + p.height, '#60a5fa', 18);
                }
            }
            if (p.type === 'rotate') {
                p.rotationTime += dt * p.rotationSpeed;
                p.rotationAngle = Math.sin(p.rotationTime) * p.rotationMaxAngle;
            }
            if (p.type === 'vanish') {
                p.vanishTimer += dt;
                const phaseTime = p.vanishTimer % p.vanishCycle;
                p.vanishActive = phaseTime < p.vanishActiveTime;
            }
        }
        Game.platforms = Game.platforms.filter((platform) => {
            const stillAboveScreen = platform.y + platform.height > -20;
            const stillSolid = platform.type !== 'crumble' || !platform.crumbling || platform.crumbleTimer > 0;
            return stillAboveScreen && stillSolid;
        });
        Game.ensurePlatformBuffer();
    },
    getHighestPlatformY: function () {
        if (Game.platforms.length === 0) {
            return 0;
        }
        return Game.platforms.reduce((highest, platform) => {
            return Math.max(highest, platform.baseY || platform.y);
        }, Game.platforms[0].baseY || Game.platforms[0].y);
    },
    ensurePlatformBuffer: function () {
        const targetTopY = Math.max(Player.y, Game.cameraY) + Game.getHeight() * Game.platformBufferScreens;
        let safety = 0;
        while (Game.getHighestPlatformY() < targetTopY && safety < 12) {
            Game.generatePlatforms(40);
            safety++;
        }
    },
    generatePlatforms: function (count) {
        let y = 0;
        let number = 0;
        if (Game.platforms.length > 0) {
            const last = Game.platforms[Game.platforms.length - 1];
            y = (last.baseY || last.y) + Game.platformVerticalDistance;
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
                vanishTimer: Math.random() * 2,
                vanishCycle: 2.2,
                vanishActiveTime: 1.35,
                vanishActive: true,
                baseX: 0,
                baseY: y,
                swingTime: Math.random() * Math.PI * 2,
                swingSpeed: 2.2,
                swingRangeX: 0,
                swingRangeY: 0,
                swingForce: 0,
                swingImpulse: 210,
                deltaX: 0,
                deltaY: 0,
                teleportTimer: 2.2 + Math.random() * 1.2,
                teleportInterval: 2.8,
                teleportWarnTime: 0.75,
                rotationTime: Math.random() * Math.PI * 2,
                rotationSpeed: 1.8,
                rotationAngle: 0,
                rotationMaxAngle: 0.26,
                rotationSlide: 88,
                spikeSafeStart: 0.24,
                spikeSafeEnd: 0.76,
                mineForceX: 175,
                mineForceY: 610,
                magnetRangeX: 165,
                magnetRangeY: 160,
                magnetStrength: 95,
                slowDuration: 2.15,
                hotDuration: 0.55,
                hotTimer: 0.55,
                thinBonus: 6,
                checkpointSlowDuration: 1.1,
                coinBonus: 12,
                comboBonus: 3,
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
            } else if (number > 24 && number % 89 === 0) {
                platform.type = 'fake';
                platform.height = 10;
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
            } else if (number > 18 && number % 41 === 0) {
                platform.type = 'vanish';
                platform.height = 10;
            } else if (number > 20 && number % 43 === 0) {
                platform.type = 'shield';
                platform.height = 12;
            } else if (number > 18 && number % 47 === 0) {
                platform.type = 'swing';
                platform.height = 10;
                platform.baseX = platform.x;
                platform.baseY = platform.y;
                platform.swingRangeX = 0;
                platform.swingRangeY = 0;
            } else if (number > 18 && number % 53 === 0) {
                platform.type = 'teleport';
                platform.height = 10;
            } else if (number > 20 && number % 59 === 0) {
                platform.type = 'rotate';
                platform.height = 10;
                platform.rotationMaxAngle = 0.28;
                platform.rotationSlide = 92;
            } else if (number > 22 && number % 61 === 0) {
                platform.type = 'spike';
                platform.height = 12;
                platform.spikeSafeStart = 0.28;
                platform.spikeSafeEnd = 0.72;
            } else if (number > 24 && number % 67 === 0) {
                platform.type = 'mine';
                platform.height = 12;
            } else if (number > 24 && number % 71 === 0) {
                platform.type = 'magnet';
                platform.height = 12;
            } else if (number > 26 && number % 73 === 0) {
                platform.type = 'slow';
                platform.height = 12;
            } else if (number > 28 && number % 79 === 0) {
                platform.type = 'hot';
                platform.height = 12;
                platform.hotTimer = platform.hotDuration;
            } else if (number > 28 && number % 83 === 0) {
                platform.type = 'thin';
                platform.width = Math.max(42, Math.floor(platform.width * 0.42));
                platform.maxWidth = platform.width;
                platform.minWidth = platform.width;
                platform.x = Math.max(8, Math.min(Game.getWidth() - platform.width - 8, platform.x + width * 0.28));
                platform.centerX = platform.x + platform.width / 2;
                platform.height = 9;
            } else if (number > 30 && number % 97 === 0) {
                platform.type = 'coin';
                platform.height = 12;
            } else if (number > 30 && number % 101 === 0) {
                platform.type = 'combo';
                platform.height = 12;
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
            if (platform.type === 'fake' && platform.used) {
                return;
            }
            const firstLandingAbove = platform.number > Game.current;
            Game.current = platform.number;
            if (firstLandingAbove) {
                Game.advanceCombo(platform);
                let nextScore = platform.number + Math.max(0, Game.comboMultiplier - 1);
                if (platform.type === 'coin' && !platform.used) {
                    platform.used = true;
                    nextScore += platform.coinBonus * Game.comboMultiplier;
                    Game.addParticles(platform.x + platform.width / 2, platform.y + platform.height, '#fbbf24', 28);
                }
                if (platform.type === 'combo') {
                    nextScore += platform.comboBonus * Game.comboMultiplier;
                    Game.addParticles(platform.x + platform.width / 2, platform.y + platform.height, '#ec4899', 24);
                }
                if (nextScore > Game.score) {
                    Game.score = nextScore;
                }
            } else if (platform.number > Game.score) {
                Game.score = platform.number;
            }
        }
    },
    resetCombo: function () {
        Game.comboCount = 0;
        Game.comboMultiplier = 1;
    },
    advanceCombo: function (platform) {
        Game.comboCount += platform.type === 'combo' ? 2 : 1;
        Game.comboMultiplier = Math.min(5, 1 + Math.floor(Game.comboCount / 4));
    },
    applyMagnetForces: function (dt) {
        if (Player.grounded) {
            return;
        }
        const playerCenter = Player.x + Player.width / 2;
        let strongestMagnet = null;
        let strongestInfluence = 0;
        for (let i = 0; i < Game.platforms.length; i++) {
            const platform = Game.platforms[i];
            if (platform.type !== 'magnet' || !Game.isPlatformSolid(platform)) {
                continue;
            }
            const platformCenter = platform.x + platform.width / 2;
            const dx = platformCenter - playerCenter;
            const dy = Math.abs((platform.y + platform.height) - Player.y);
            const inRangeX = Math.abs(dx) < platform.magnetRangeX;
            const inRangeY = dy < platform.magnetRangeY;
            if (!inRangeX || !inRangeY) {
                continue;
            }
            const influence = (1 - Math.abs(dx) / platform.magnetRangeX) *
                (1 - dy / platform.magnetRangeY);
            if (influence > strongestInfluence) {
                strongestInfluence = influence;
                strongestMagnet = platform;
            }
        }
        if (!strongestMagnet) {
            return;
        }
        const targetCenter = strongestMagnet.x + strongestMagnet.width / 2;
        const direction = targetCenter > playerCenter ? 1 : -1;
        Player.x = Math.max(0, Math.min(
            Game.getWidth() - Player.width,
            Player.x + direction * strongestMagnet.magnetStrength * strongestInfluence * dt
        ));
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
        if (!Game.isPlatformSolid(platform)) {
            Player.grounded = false;
            return;
        }
        const horizontalOverlap = Player.x + Player.width > platform.x + 4 &&
            Player.x < platform.x + platform.width - 4;
        if (horizontalOverlap) {
            if (platform.type === 'hot' && !platform.used) {
                platform.hotTimer = Math.max(0, platform.hotTimer - dt);
                if (platform.hotTimer <= 0) {
                    platform.used = true;
                    if (Player.shield) {
                        Player.shield = false;
                        Player.grounded = false;
                        Player.velocityY = Player.boostJumpVelocity * 0.78;
                        Player.previousY = Player.y;
                        Game.addParticles(Player.x + Player.width / 2, Player.y, '#81e6d9', 30);
                    } else {
                        Game.addParticles(Player.x + Player.width / 2, Player.y, '#f97316', 34);
                        Game.resetCombo();
                        Game.finish();
                    }
                    return;
                }
            }
            if (platform.type === 'conveyor') {
                Player.x = Math.max(0, Math.min(
                    Game.getWidth() - Player.width,
                    Player.x + platform.conveyorDirection * platform.conveyorSpeed * dt
                ));
            }
            if (platform.type === 'swing' || platform.type === 'teleport') {
                Player.x = Math.max(0, Math.min(Game.getWidth() - Player.width, Player.x + platform.deltaX));
                Player.y += platform.deltaY;
            }
            if (platform.type === 'rotate') {
                Player.x = Math.max(0, Math.min(
                    Game.getWidth() - Player.width,
                    Player.x + Math.sin(platform.rotationAngle) * platform.rotationSlide * dt
                ));
            }
            Player.y = platform.y + platform.height;
            Player.previousY = Player.y;
        } else {
            Player.grounded = false;
            Game.resetCombo();
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
    handleFallout: function () {
        if (!Player.shield) {
            Game.resetCombo();
            Game.finish();
            return;
        }
        const rescuePlatform = Game.findRescuePlatform();
        if (!rescuePlatform) {
            Game.resetCombo();
            Game.finish();
            return;
        }
        Player.shield = false;
        Player.x = Math.max(8, Math.min(
            Game.getWidth() - Player.width - 8,
            rescuePlatform.x + rescuePlatform.width / 2 - Player.width / 2
        ));
        Player.y = rescuePlatform.y + rescuePlatform.height + 4;
        Player.previousY = Player.y;
        Player.velocityY = Player.boostJumpVelocity * 0.72;
        Player.grounded = false;
        Player.landingPulse = 1;
        Game.cameraY = Math.max(0, Player.y + Player.height - Game.getHeight() * 0.72);
        Game.addParticles(Player.x + Player.width / 2, Player.y, '#81e6d9', 34);
        Game.updateHud();
    },
    findRescuePlatform: function () {
        let candidate = null;
        for (let i = 0; i < Game.platforms.length; i++) {
            const platform = Game.platforms[i];
            if (!Game.isPlatformSolid(platform)) {
                continue;
            }
            const visibleY = Game.worldToScreenY(platform.y, platform.height);
            const safelyVisible = visibleY > Game.getHeight() * 0.38 && visibleY < Game.getHeight() - 80;
            if (safelyVisible && (!candidate || platform.y > candidate.y)) {
                candidate = platform;
            }
        }
        return candidate;
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
                if (Game.platforms[i].baseX !== undefined) {
                    Game.platforms[i].baseX *= scale;
                }
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
