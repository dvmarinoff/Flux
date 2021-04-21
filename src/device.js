import { exists } from './functions.js';

class Device {
    constructor(args) {
        if(!exists(args)) args = {};
        this.protocol = args.protocol;
    }
    connect() {
        const self = this;
        return this.protocol.connect();
    }
}

export { Device }
