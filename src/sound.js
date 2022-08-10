import { equals, exists, xf } from './functions.js';

const notes = [
    {}, // 0
    {}, // 1
    {}, // 2
    {c: 130.81, 'c#': 138.59, d: 146.83, 'd#': 155.56, e: 164.81, f: 174.61,
     'f#': 185.00, g: 196.00, 'g#': 207.65, a: 220.00, 'a#': 233.08, b: 246.94}, // 3

    {c: 261.63, 'c#': 277.18, d: 293.66, 'd#': 311.13, e: 329.63, f: 349.23,
     'f#': 369.99, g: 392.00, 'g#': 415.30, a: 440.00, 'a#': 466.16, b: 493.88, }, // 4

    {c: 523.25, 'c#': 554.37, d: 587.33, 'd#': 622.25, e: 659.25, f: 698.46,
     'f#': 739.99, g: 783.99, 'g#': 830.61, a: 880.00, 'a#': 932.33, b: 987.77}, // 5
];

function Sound(args) {
    let vibrate = false;
    let sound = false;
    let volume = args.volume ?? 0;
    let audioContext;
    let oscillator;
    let abortController;

    function start() {
        abortController = new AbortController();
        let signal = { signal: abortController.signal };

        xf.sub(`db:sound`, x => {
            sound = x;
        }, signal);

        xf.sub(`db:volume`, x => {
            volume = x;
        }, signal);

        xf.sub('watch:started', _ => {
            if(!exists(audioContext)) {
                audioContext = new AudioContext();
            }
        }, signal);

        xf.sub('watch:beep', _ => {
            interval();
        }, signal);

        xf.sub('watch:paused', _ => {
            if(exists(oscillator)) {
                audioContext.suspend();
            }
        }, signal);

        xf.sub('watch:started', _ => {
            if(exists(audioContext) && exists(oscillator)) {
                if(equals(audioContext.state, 'suspended')) {
                    audioContext.resume();
                }
            }
        }, signal);
    }

    function stop() {
        abortController.abort();
    }

    function interval() {
        const options = {
            type: 'triangle',
        };
        oscillator = new OscillatorNode(audioContext, options);
        const gainNode = audioContext.createGain();

        const high = volume / 100;
        const low = 0;
        const time = audioContext.currentTime;

        gainNode.gain.setTargetAtTime(low,  time, 0);
        gainNode.gain.setTargetAtTime(high, time+0.84, 0.001);
        gainNode.gain.setTargetAtTime(low,  time+1.00, 0.001);
        gainNode.gain.setTargetAtTime(high, time+1.84, 0.001);
        gainNode.gain.setTargetAtTime(low,  time+2.00, 0.001);
        gainNode.gain.setTargetAtTime(high, time+2.84, 0.001);
        gainNode.gain.setTargetAtTime(low,  time+3.00, 0.001);
        gainNode.gain.setTargetAtTime(high, time+3.84, 0.001);
        gainNode.gain.setTargetAtTime(low,  time+4.00, 0.001);

        oscillator.frequency.setValueAtTime(notes[5].c, time);
        oscillator.frequency.setValueAtTime(notes[5].a, time+3.74);

        oscillator.connect(gainNode).connect(audioContext.destination);

        oscillator.start(time);
        oscillator.stop(time + 4.015);
    }

    return Object.freeze({
        start,
        stop,
        interval,
    });
}

export { Sound };
