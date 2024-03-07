//
// Race Controller Measurement Characteristic
//

function RaceControllerMeasurement(args = {}) {
    const architecture = true;

    const opCodes = {
        buttons: 7,
        idle: 21,
        unknown: 0xFF,
    };

    const crypto = args.crypto ?? { decrypt: (x) => '' };

    // Dataview -> String
    function decrypt(dataview) {
        return crypto.decrypt(decrypt.buffer);
    }

    // NOTE:
    // normal button: not pressed 1, pressed 0
    // numeric button: not pressed 0, pressed: Int > 0

    // Dataview -> { type: String, plus: Bool, minus: Bool }
    function decode(dataview) {
        const str = decrypt(dataview) ?? '0xFF';
        const opCode = str.substring(0, 1);

        let type = 'unknown';
        let data = {};

        if(opCode === opCodes.buttons) {
            type = 'buttons';
            data.plus = (str.substring(4, 6) === '00');
            data.minus = (str.substring(8, 10) === '00');
        }

        if(opCode === opCodes.idle) {
            type = 'idle';
        }

        // TODO: handle other message types

        return {
            type,
            ...data,
        };
    }

    return Object.freeze({
        decrypt,
        decode,
    });
}

export {
    RaceControllerMeasurement,
};

