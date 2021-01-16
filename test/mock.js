import { xf } from '../xf.js';
import { avgOfArray,
         maxOfArray,
         sum,
         mps,
         kph,
         rand,
         first,
         last,
         round,
         timeDiff } from '../functions.js';

function DataMock(args) {
    let count = 0;
    let interval = null;
    let power = 0;

    xf.sub('db:targetPwr', pwr => {
        power = pwr;
    });

    xf.sub('watch:started', e => {

        interval = setInterval(function() {
            // let power    = (count % 60) < 30 ?  100 : 300;

            let hr       = (count % 60) < 30 ?  120 : 160;
            let cadence  = (count % 60) < 30 ?   75 : 90;
            let speed    = (count % 60) < 30 ? 27.0 : 39.0;
            // let distance = count * mps(speed);

            if(args.hr) {
                xf.dispatch('device:hr', hr);
            }
            if(args.pwr) {
                xf.dispatch('device:pwr',  power + rand(-10, 10));
                xf.dispatch('device:cad',  cadence);
                xf.dispatch('device:spd',  speed);
                // xf.dispatch('device:dist', distance);
            }
            console.log(`mock ${power}`);
            count += 1;
        }, 700);
    });

    xf.sub('watch:stopped', e => {
        count = 0;
        clearInterval(interval);
    });

    xf.sub('watch:paused', e => {
        clearInterval(interval);
    });

    console.warn(`DATA MOCK is ON!`);
}

let RecordedData = (function () {
    let d = [];
    let t = 1603996080000;

    for(let i=0; i< 60 * 10; i++) {
        d.push({power:     (i % 240) < 120 ? 100 : 300,
                speed:     (i % 240) < 120 ? 25  : 39,
                cadence:   (i % 7) === 0 ? 80  : 80+(i % 7),
                timestamp: t + (i * 1000)});
    }
    return d;
}());

let RecordedLaps = (function () {
    let laps      = [];
    let time      = 1603996080000;
    let power     = 0;
    let lapPower  = [];
    let restPower = 100;
    let workPower = 300;
    let interval  = restPower;
    let timeStart = 1603996080000;
    let timeEnd   = 0;
    let elapsed   = 0;
    let scale     = 1000; // from FIT profile spec

    for(let i=0; i< 60 * 10; i++) {
        power = (i % 240) < 120 ? restPower : workPower;
        if (power !== interval || i === ((60 * 10) - 1)) {
            timeEnd  = time + (i * scale);
            interval = power;
            elapsed  = timeDiff(timeStart, timeEnd);

            laps.push({timestamp:        timeEnd,
                       startTime:        timeStart,
                       totalElapsedTime: elapsed,
                       avgPower:         round(avgOfArray(lapPower)),
                       maxPower:         maxOfArray(lapPower)});

            lapPower  = [];
            timeStart = timeEnd + (1 * scale);
        }
        lapPower.push(power);
    }

    return laps;
}());


export { DataMock, RecordedData, RecordedLaps };
