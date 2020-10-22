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
    }
    checkVisibility() {
        let isVisible = false;
        let visibilityState = document.visibilityState;
        // console.log(visibilityState);

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
            // console.log(`lock screen`);

            lock.addEventListener('release', e => {
                self.isLocked = false;
                console.log(`Wake lock released.`);
            });
        }
    }
}

export { WakeLock };
