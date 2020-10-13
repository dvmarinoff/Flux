import { xf } from './xf.js';

let data =
    [
        {repeat: 1, steps: [{duration: 3, target: 100}]},
        {repeat: 3, steps: [{duration: 6, target: 235}, {duration: 3, target: 100}]},
        {repeat: 1, steps: [{duration: 3, target: 100}]},
    ];

let ws = `
<workout_file>
    <author>Marinov</author>
    <name>4x10 min Sweet Spot</name>
    <description>A Classic sweet spot workout.</description>
    <sportType>bike</sportType>
    <tags>
        <tag name="sweet"/>
        <tag name="spot"/>
    </tags>
    <workout>
        <Warmup Duration="300" PowerLow="0.25" PowerHigh="0.75"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.92" OffPower="0.39"/>
        <SteadyState Duration="180" Power="0.39"/>
        <IntervalsT Repeat="4" OnDuration="600" OffDuration="300" OnPower="0.92" OffPower="0.39"/>
        <Cooldown Duration="600" PowerLow="0.47" PowerHigh="0.25"/>
    </workout>
</workout_file>
`;

function handleTag(tag) {
    console.log(`${tag.tagName} ${tag.tagName == 'Warmup'}`);
    switch(tag.tagName) {
    case 'Warmup': return {duration: parseInt(tag.getAttribute('Duration'))};
        break;
    case 'IntervalsT': return {duration:
                        (parseInt(tag.getAttribute('OnDuration')) +
                         parseInt(tag.getAttribute('OffDuration'))) *
                        parseInt(tag.getAttribute('Repeat'))
                       };
        break;
    case 'SteadyState': return {duration: parseInt(tag.getAttribute('Duration'))};
        break;
    case 'Cooldown': return {duration: parseInt(tag.getAttribute('Duration'))};
        break;
    }
}

function parseZwo(zwo) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(zwo, 'text/xml');

    let workout = doc.querySelector('workout');
    let steps = Array.from(workout.children);
    let w = [];

    console.log(doc);
    console.log(workout);
    console.log(steps.length);

    steps.forEach(step => {
        w.push(handleTag(step));
    });
    console.log(w);
}

class StopWatch {
    constructor(args) {
        this.interval = undefined;
        this.elapsed = 0;
        this.lapTime = 0;
        this.laps = [];
        this.currentLapStart = 0;
    }
    start() {
        let self = this;
        self.interval = setInterval(self.onInterval.bind(self), 1000);
    }
    lap() {
        let self = this;
        self.lapTime = 0;
        self.laps.push({start:   self.currentLapStart,
                        end:     self.elapsed,
                        lapTime: (self.elapsed - self.currentLapStart),
                        total:   self.elapsed});
        self.currentLapStart = self.elapsed;
        xf.dispatch('workout:interval', 0);
    }
    pause() {
        let self = this;
        clearInterval(self.interval);
    }
    resume() {
        let self = this;
        self.interval = setInterval(self.onInterval.bind(self), 1000);
    }
    stop () {
        let self = this;
        clearInterval(self.interval);
        this.elapsed = 0;
        self.lapTime = 0;
        xf.dispatch('workout:elapsed', 0);
        xf.dispatch('workout:interval', 0);
    }
    onInterval() {
        let self = this;
        self.elapsed += 1;
        self.lapTime += 1;
        xf.dispatch('workout:elapsed',  self.elapsed);
        xf.dispatch('workout:interval', self.lapTime);
    }
}

export { StopWatch };
