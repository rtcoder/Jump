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
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, platform.x, screenY, platform.width, platform.height, 5);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (platform.type === 'spring') {
        ctx.fillStyle = '#102a27';
        ctx.fillRect(platform.x + platform.width * 0.35, screenY + 3, platform.width * 0.3, 2);
    }
    if (platform.number % 100 === 0) {
        ctx.fillStyle = '#1a1f2c';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(platform.number, platform.x + platform.width / 2, screenY + platform.height - 4);
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
