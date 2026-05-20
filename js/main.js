import { Game, initGame } from './game.js?v=module-18';
import { resetControls, setupKeyboardControls, setupTouchControls } from './keys.js?v=module-18';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const newGameButton = document.getElementById('new-game-button');

initGame(canvas, ctx);
setupKeyboardControls();
setupTouchControls();

newGameButton.addEventListener('click', () => {
    Game.startGame();
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
