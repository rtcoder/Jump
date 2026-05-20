import { Game, initGame } from './game.js?v=module-2';
import { setupKeyboardControls, setupTouchControls } from './keys.js?v=module-2';

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
