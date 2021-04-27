import { xf } from './functions.js';

class WakeLock {
    constructor(args) {
        this.lock = undefined;
        this.isLocked = false;
        this.isLocable = false;
        this.isVisible = false;
        this.init();
    }
    init() {
        let self = this;
        self.isLocable = ('wakeLock' in navigator);
        self.isVisible = self.checkVisibility();

        self.lockScreen();

        document.addEventListener('visibilitychange', self.onVisibilityChange.bind(self));

        window.addEventListener('beforeunload', e => {
            xf.dispatch('lock:beforeunload');
        });
    }
    checkVisibility() {
        let isVisible = false;
        let visibilityState = document.visibilityState;

        if(visibilityState === 'visible') {
            isVisible = true;
        } else {
            isVisible = false;
        }
        return isVisible;
    }
    onVisibilityChange () {
        let self = this;

        if(self.checkVisibility()) {
            self.lockScreen();
        }
    }
    async lockScreen() {
        let self = this;
        if(self.isLocable && self.isVisible) {
            let lock = await navigator.wakeLock.request('screen');
            self.isLocked = true;

            lock.addEventListener('release', e => {
                self.isLocked = false;
                xf.dispatch('lock:release');
                console.log(`Wake lock released.`);
            });
        }
    }
}

const lock = new WakeLock();

export { lock };
