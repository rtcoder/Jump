import { Game, initGame } from './game.js?v=module-20';
import { resetControls, setupKeyboardControls, setupTouchControls } from './keys.js?v=module-20';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const newGameButton = document.getElementById('new-game-button');
const playTab = document.getElementById('tab-play');
const platformsTab = document.getElementById('tab-platforms');
const platformsPanel = document.getElementById('platforms-panel');

function setMenuTab(tabName) {
    const showPlatforms = tabName === 'platforms';
    playTab.classList.toggle('is-active', !showPlatforms);
    platformsTab.classList.toggle('is-active', showPlatforms);
    playTab.setAttribute('aria-selected', showPlatforms ? 'false' : 'true');
    platformsTab.setAttribute('aria-selected', showPlatforms ? 'true' : 'false');
    platformsPanel.hidden = !showPlatforms;
}

initGame(canvas, ctx);
setupKeyboardControls();
setupTouchControls();

newGameButton.addEventListener('click', () => {
    Game.startGame();
});

playTab.addEventListener('click', () => {
    setMenuTab('play');
});

platformsTab.addEventListener('click', () => {
    setMenuTab('platforms');
});

window.addEventListener('resize', () => {
    Game.handleResize();
});

window.addEventListener('orientationchange', () => {
    resetControls();
    window.setTimeout(() => {
        Game.handleResize();
    }, 120);
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        Game.handleResize();
    });
}
