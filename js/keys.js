export const keys = {
    right: false,
    left: false,
    space: false,
};

function setKey(code, value) {
    if (code === 32 || code === 'Space') {
        keys.space = value;
    }
    if (code === 37 || code === 'ArrowLeft') {
        keys.left = value;
    }
    if (code === 39 || code === 'ArrowRight') {
        keys.right = value;
    }
}

export function setupKeyboardControls() {
    document.addEventListener('keyup', function (e) {
        setKey(e.keyCode || e.code, false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 32 || e.keyCode === 37 || e.keyCode === 39) {
            e.preventDefault();
        }
        setKey(e.keyCode || e.code, true);
    });
}

function bindTouchControl(id, keyName) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }
    const setActive = (value) => {
        keys[keyName] = value;
    };
    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        element.setPointerCapture(e.pointerId);
        setActive(true);
    });
    element.addEventListener('pointerup', (e) => {
        e.preventDefault();
        setActive(false);
    });
    element.addEventListener('pointercancel', () => {
        setActive(false);
    });
    element.addEventListener('pointerleave', () => {
        setActive(false);
    });
}

export function setupTouchControls() {
    bindTouchControl('touch-left', 'left');
    bindTouchControl('touch-right', 'right');
    bindTouchControl('touch-jump', 'space');
}
