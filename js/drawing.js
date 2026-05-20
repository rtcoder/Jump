function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawBackground(ctx, Game) {
    const width = Game.getWidth();
    const height = Game.getHeight();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1f2424');
    gradient.addColorStop(1, '#2e332f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (var y = (height + Game.cameraY * 0.35) % 48; y < height; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function getPlatformColor(Game, platform) {
    if (platform.number === Game.current) {
        return Game.colors.current;
    }
    return Game.colors[platform.type] || Game.colors.normal;
}

function drawPlatform(ctx, Game, platform) {
    const screenY = Game.worldToScreenY(platform.y, platform.height);
    const color = getPlatformColor(Game, platform);
    const crumbleProgress = platform.crumbling ?
        1 - Math.max(0, platform.crumbleTimer) / platform.crumbleDuration :
        0;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.globalAlpha = platform.type === 'crumble' ? 1 - crumbleProgress * 0.45 : 1;
    if (platform.type === 'boost' && platform.used) {
        ctx.globalAlpha = 0.45;
    }
    if (platform.type === 'vanish') {
        ctx.globalAlpha = platform.vanishActive ? 0.9 : 0.26;
    }
    if (platform.type === 'shield' && platform.used) {
        ctx.globalAlpha = 0.42;
    }
    if (platform.type === 'mine' && platform.used) {
        ctx.globalAlpha = 0.38;
    }
    if (platform.type === 'fake' && platform.used) {
        ctx.globalAlpha = 0.22;
    }
    drawRoundedRect(ctx, platform.x, screenY, platform.width, platform.height, 5);
    ctx.fillStyle = color;
    ctx.fill();
    if (platform.type === 'mine') {
        ctx.strokeStyle = platform.used ? 'rgba(255, 255, 255, .45)' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (platform.type === 'spring') {
        ctx.fillStyle = '#102a27';
        ctx.fillRect(platform.x + platform.width * 0.35, screenY + 3, platform.width * 0.3, 2);
    }
    if (platform.type === 'ice') {
        ctx.strokeStyle = 'rgba(255, 255, 255, .78)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const x = platform.x + 12 + i * (platform.width - 24) / 3;
            ctx.beginPath();
            ctx.moveTo(x - 7, screenY + platform.height - 2);
            ctx.lineTo(x + 7, screenY + 2);
            ctx.stroke();
        }
    }
    if (platform.type === 'boost') {
        ctx.fillStyle = platform.used ? 'rgba(255, 255, 255, .45)' : '#ffffff';
        const centerX = platform.x + platform.width / 2;
        const arrowY = screenY + platform.height / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, arrowY - 5);
        ctx.lineTo(centerX - 8, arrowY + 4);
        ctx.lineTo(centerX - 3, arrowY + 4);
        ctx.lineTo(centerX - 3, arrowY + 7);
        ctx.lineTo(centerX + 3, arrowY + 7);
        ctx.lineTo(centerX + 3, arrowY + 4);
        ctx.lineTo(centerX + 8, arrowY + 4);
        ctx.closePath();
        ctx.fill();
    }
    if (platform.type === 'vertical') {
        ctx.strokeStyle = 'rgba(255, 255, 255, .82)';
        ctx.lineWidth = 2;
        const centerX = platform.x + platform.width / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, screenY + 2);
        ctx.lineTo(centerX, screenY + platform.height - 2);
        ctx.moveTo(centerX, screenY + 2);
        ctx.lineTo(centerX - 5, screenY + 6);
        ctx.moveTo(centerX, screenY + 2);
        ctx.lineTo(centerX + 5, screenY + 6);
        ctx.moveTo(centerX, screenY + platform.height - 2);
        ctx.lineTo(centerX - 5, screenY + platform.height - 6);
        ctx.moveTo(centerX, screenY + platform.height - 2);
        ctx.lineTo(centerX + 5, screenY + platform.height - 6);
        ctx.stroke();
    }
    if (platform.type === 'conveyor') {
        ctx.fillStyle = 'rgba(17, 24, 39, .55)';
        const arrowCount = Math.max(2, Math.floor(platform.width / 42));
        for (let i = 0; i < arrowCount; i++) {
            const centerX = platform.x + (i + 0.5) * platform.width / arrowCount;
            const arrowY = screenY + platform.height / 2;
            const direction = platform.conveyorDirection;
            ctx.beginPath();
            ctx.moveTo(centerX + direction * 8, arrowY);
            ctx.lineTo(centerX - direction * 4, arrowY - 5);
            ctx.lineTo(centerX - direction * 4, arrowY + 5);
            ctx.closePath();
            ctx.fill();
        }
    }
    if (platform.type === 'vanish') {
        ctx.strokeStyle = platform.vanishActive ? '#ffffff' : 'rgba(255, 255, 255, .45)';
        ctx.lineWidth = 2;
        const dashWidth = Math.max(14, platform.width / 6);
        for (let x = platform.x + 8; x < platform.x + platform.width - 8; x += dashWidth) {
            ctx.beginPath();
            ctx.moveTo(x, screenY + platform.height / 2);
            ctx.lineTo(Math.min(platform.x + platform.width - 8, x + dashWidth * 0.45), screenY + platform.height / 2);
            ctx.stroke();
        }
    }
    if (platform.type === 'shield') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.strokeStyle = platform.used ? 'rgba(255, 255, 255, .5)' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 6);
        ctx.quadraticCurveTo(centerX + 8, centerY - 4, centerX + 7, centerY + 2);
        ctx.quadraticCurveTo(centerX + 5, centerY + 8, centerX, centerY + 10);
        ctx.quadraticCurveTo(centerX - 5, centerY + 8, centerX - 7, centerY + 2);
        ctx.quadraticCurveTo(centerX - 8, centerY - 4, centerX, centerY - 6);
        ctx.stroke();
    }
    if (platform.type === 'swing') {
        ctx.strokeStyle = 'rgba(255, 255, 255, .82)';
        ctx.lineWidth = 2;
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        const bobX = centerX + (platform.swingForce || 0) * 13;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 13, Math.PI * 0.12, Math.PI * 0.88, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 2);
        ctx.lineTo(bobX, centerY + 6);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bobX, centerY + 6, 3, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    if (platform.type === 'teleport') {
        const warning = platform.teleportTimer < platform.teleportWarnTime;
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.strokeStyle = warning ? '#ffffff' : 'rgba(255, 255, 255, .72)';
        ctx.lineWidth = warning ? 3 : 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, warning ? 9 : 6, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX - 12, centerY);
        ctx.lineTo(centerX + 12, centerY);
        ctx.moveTo(centerX, centerY - 7);
        ctx.lineTo(centerX, centerY + 7);
        ctx.stroke();
    }
    if (platform.type === 'rotate') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-(platform.rotationAngle || 0));
        ctx.fillStyle = 'rgba(255, 255, 255, .9)';
        drawRoundedRect(ctx, -platform.width * 0.22, -2, platform.width * 0.44, 4, 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(17, 24, 39, .45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-platform.width * 0.18, 0);
        ctx.lineTo(platform.width * 0.18, 0);
        ctx.stroke();
        ctx.restore();
    }
    if (platform.type === 'spike') {
        const safeStart = platform.x + platform.width * platform.spikeSafeStart;
        const safeEnd = platform.x + platform.width * platform.spikeSafeEnd;
        ctx.fillStyle = 'rgba(255, 255, 255, .9)';
        drawRoundedRect(ctx, safeStart, screenY + 3, safeEnd - safeStart, platform.height - 6, 3);
        ctx.fill();
        ctx.fillStyle = '#7f1d1d';
        const spikeCount = Math.max(3, Math.floor(platform.width / 24));
        for (let i = 0; i < spikeCount; i++) {
            const x = platform.x + (i + 0.5) * platform.width / spikeCount;
            if (x > safeStart - 4 && x < safeEnd + 4) {
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(x, screenY - 8);
            ctx.lineTo(x - 6, screenY + 1);
            ctx.lineTo(x + 6, screenY + 1);
            ctx.closePath();
            ctx.fill();
        }
    }
    if (platform.type === 'mine') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.fillStyle = platform.used ? 'rgba(255, 255, 255, .45)' : '#fb923c';
        ctx.beginPath();
        ctx.arc(centerX, centerY, platform.used ? 4 : 7, 0, 2 * Math.PI, false);
        ctx.fill();
        if (!platform.used) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX - 12, centerY);
            ctx.lineTo(centerX + 12, centerY);
            ctx.moveTo(centerX, centerY - 8);
            ctx.lineTo(centerX, centerY + 8);
            ctx.stroke();
        }
    }
    if (platform.type === 'magnet') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX - 7, centerY, 5, Math.PI * 0.5, Math.PI * 1.5, false);
        ctx.arc(centerX + 7, centerY, 5, Math.PI * 1.5, Math.PI * 0.5, false);
        ctx.stroke();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    if (platform.type === 'slow') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 7, -Math.PI * 0.5, Math.PI * 1.2, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - 5);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 5, centerY + 2);
        ctx.stroke();
    }
    if (platform.type === 'hot') {
        const progress = Math.max(0, Math.min(1, platform.hotTimer / platform.hotDuration));
        const centerX = platform.x + platform.width / 2;
        const warning = progress < 0.35;
        ctx.fillStyle = 'rgba(124, 45, 18, .65)';
        drawRoundedRect(ctx, platform.x + 7, screenY + 3, platform.width - 14, 4, 2);
        ctx.fill();
        ctx.fillStyle = warning ? '#ffffff' : 'rgba(255, 255, 255, .88)';
        drawRoundedRect(ctx, platform.x + 7, screenY + 3, (platform.width - 14) * progress, 4, 2);
        ctx.fill();
        ctx.fillStyle = warning ? '#ffffff' : '#7c2d12';
        for (let i = 0; i < 3; i++) {
            const flameX = centerX - 13 + i * 13;
            ctx.beginPath();
            ctx.moveTo(flameX, screenY - 8);
            ctx.quadraticCurveTo(flameX + 5, screenY - 1, flameX, screenY + 3);
            ctx.quadraticCurveTo(flameX - 5, screenY - 1, flameX, screenY - 8);
            ctx.fill();
        }
    }
    if (platform.type === 'thin') {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(platform.x + 5, screenY + platform.height / 2);
        ctx.lineTo(platform.x + platform.width - 5, screenY + platform.height / 2);
        ctx.stroke();
        if (!platform.used) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('+', platform.x + platform.width / 2, screenY + platform.height - 2);
        }
    }
    if (platform.type === 'coin') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.fillStyle = platform.used ? 'rgba(255, 255, 255, .45)' : '#fff7ad';
        ctx.beginPath();
        ctx.arc(centerX, centerY, platform.used ? 4 : 8, 0, 2 * Math.PI, false);
        ctx.fill();
        if (!platform.used) {
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI, false);
            ctx.stroke();
        }
    }
    if (platform.type === 'combo') {
        const centerX = platform.x + platform.width / 2;
        const centerY = screenY + platform.height / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('x+', centerX, centerY + 4);
        ctx.strokeStyle = 'rgba(255, 255, 255, .82)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 13, Math.PI * 0.15, Math.PI * 1.85, false);
        ctx.stroke();
    }
    if (platform.type === 'fake') {
        ctx.strokeStyle = platform.used ? 'rgba(255, 255, 255, .24)' : 'rgba(255, 255, 255, .42)';
        ctx.lineWidth = 2;
        const dashWidth = Math.max(10, platform.width / 7);
        for (let x = platform.x + 8; x < platform.x + platform.width - 8; x += dashWidth) {
            ctx.beginPath();
            ctx.moveTo(x, screenY + 2);
            ctx.lineTo(Math.min(platform.x + platform.width - 8, x + dashWidth * 0.42), screenY + platform.height - 2);
            ctx.stroke();
        }
    }
    if (platform.type === 'crumble') {
        ctx.strokeStyle = platform.crumbling ? '#5f3d2d' : 'rgba(95, 61, 45, .72)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(platform.x + platform.width * 0.18, screenY + 2);
        ctx.lineTo(platform.x + platform.width * 0.32, screenY + platform.height - 2);
        ctx.moveTo(platform.x + platform.width * 0.5, screenY + 1);
        ctx.lineTo(platform.x + platform.width * 0.58, screenY + platform.height - 1);
        ctx.moveTo(platform.x + platform.width * 0.72, screenY + 2);
        ctx.lineTo(platform.x + platform.width * 0.64, screenY + platform.height - 2);
        ctx.stroke();
    }
    if (platform.number % 100 === 0) {
        ctx.strokeStyle = 'rgba(26, 31, 44, .55)';
        ctx.lineWidth = 2;
        const centerX = platform.x + platform.width / 2;
        ctx.beginPath();
        ctx.moveTo(platform.x + 18, screenY + platform.height / 2);
        ctx.lineTo(centerX - 22, screenY + platform.height / 2);
        ctx.moveTo(centerX + 22, screenY + platform.height / 2);
        ctx.lineTo(platform.x + platform.width - 18, screenY + platform.height / 2);
        ctx.stroke();
        ctx.fillStyle = '#1a1f2c';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(platform.number, centerX, screenY + platform.height - 4);
    }
}

function drawPlayer(ctx, Game, Player, playerAction) {
    const screenX = Player.x;
    const screenY = Game.worldToScreenY(Player.y, Player.height);
    const centerX = screenX + Player.width / 2;
    const pulse = Player.landingPulse;
    const headSize = 11 + pulse * 1.5;
    const bodyTop = screenY + 18;
    const bodyBottom = screenY + Player.height - 14;
    const legSwing = playerAction.playerI * 0.35;
    const jumpLean = Math.max(-4, Math.min(4, Player.velocityY / 90));

    ctx.save();
    ctx.translate(centerX, screenY + Player.height);
    ctx.scale(1 + pulse * 0.08, 1 - pulse * 0.08);
    ctx.translate(-centerX, -(screenY + Player.height));

    ctx.strokeStyle = Player.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop);
    ctx.lineTo(centerX + jumpLean, bodyBottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + jumpLean, bodyBottom);
    ctx.lineTo(centerX - 7 - legSwing, screenY + Player.height);
    ctx.moveTo(centerX + jumpLean, bodyBottom);
    ctx.lineTo(centerX + 7 + legSwing, screenY + Player.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, screenY + 11, headSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = Player.color;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 4 + Player.facing, screenY + 9, 2, 0, 2 * Math.PI, false);
    ctx.arc(centerX + 4 + Player.facing, screenY + 9, 2, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.restore();

    if (Player.shield) {
        ctx.strokeStyle = 'rgba(129, 230, 217, .85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, screenY + 20, 22, 0, 2 * Math.PI, false);
        ctx.stroke();
    }
}

function drawParticles(ctx, Game) {
    for (let i = 0; i < Game.particles.length; i++) {
        const particle = Game.particles[i];
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, Game.worldToScreenY(particle.y), 2.5, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

export function drawView(ctx, Game, Player, playerAction) {
    drawBackground(ctx, Game);
    for (let i = 0; i < Game.platforms.length; i++) {
        const platform = Game.platforms[i];
        const screenY = Game.worldToScreenY(platform.y, platform.height);
        if (screenY < Game.getHeight() + 40 && screenY > -40) {
            drawPlatform(ctx, Game, platform);
        }
    }
    drawParticles(ctx, Game);
    drawPlayer(ctx, Game, Player, playerAction);
}
