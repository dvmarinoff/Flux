import { xf, exists } from '../functions.js';

function Keyboard() {

    const isKeyUp    = (code) => code === 'ArrowUp';
    const isKeyDown  = (code) => code === 'ArrowDown';
    const isKeyE     = (code) => code === 'KeyE';
    const isKeyR     = (code) => code === 'KeyR';
    const isKeyS     = (code) => code === 'KeyS';
    const isKeyL     = (code) => code === 'KeyL';
    const isKeySpace = (code) => code === 'Space';

    window.addEventListener('keydown', onKeydown.bind(this));

    function onKeydown(e) {
        let keyCode = e.keyCode;
        let code = e.code;

        if (e.isComposing ||
            keyCode === 229 ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            exists(e.target.form)) {
            return;
        }

        if(isKeyUp(code)) {
            e.preventDefault();
            xf.dispatch('key:up');
        }
        if(isKeyDown(code)) {
            e.preventDefault();
            xf.dispatch('key:down');
        }
        if(isKeyS(code)) {
            xf.dispatch('key:s');
        }
        if(isKeyR(code)) {
            xf.dispatch('key:r');
        }
        if(isKeyE(code)) {
            xf.dispatch('key:e');
        }
        if(isKeyL(code)) {
            xf.dispatch('key:l');
        }
        if(isKeySpace(code)) {
            e.preventDefault();
            xf.dispatch('key:space');
        }
    }
}


function KeyboardControls() {
    let mode = 'erg';
    xf.sub('db:mode', x => mode = x);

    let watchStatus = 'stopped';
    xf.sub('db:watchStatus', x => watchStatus = x);

    // Modes Inc/Dec
    xf.sub('key:up', e => {
        if(mode === 'erg') {
            xf.dispatch('ui:power-target-inc');
        }
        if(mode === 'resistance') {
            xf.dispatch('ui:resistance-target-inc');
        }
        if(mode === 'slope') {
            xf.dispatch('ui:slope-target-inc');
        }
    });
    xf.sub('key:down', e => {
        if(mode === 'erg') {
            xf.dispatch('ui:power-target-dec');
        }
        if(mode === 'resistance') {
            xf.dispatch('ui:resistance-target-dec');
        }
        if(mode === 'slope') {
            xf.dispatch('ui:slope-target-dec');
        }
    });

    // Modes
    xf.sub('key:e', e => {
        xf.dispatch('ui:mode-set', 'erg');
    });
    xf.sub('key:r', e => {
        xf.dispatch('ui:mode-set', 'resistance');
    });
    xf.sub('key:s', e => {
        xf.dispatch('ui:mode-set', 'slope');
    });

    // Watch
    xf.sub('key:space', e => {
        if(watchStatus === 'paused' || watchStatus === 'stopped') {
            xf.dispatch('ui:watchStart');
        } else {
            xf.dispatch('ui:watchPause');
        }
    });
    xf.sub('key:l', e => {
        xf.dispatch('ui:watchLap');
    });
}

Keyboard();
KeyboardControls();

export { Keyboard, KeyboardControls };
