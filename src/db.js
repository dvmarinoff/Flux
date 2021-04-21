import { xf, exists, equals, prn } from '../functions.js';
import { models } from './models/models.js';

let db = {
    power: models.power.default(),
    heartRate: models.heartRate.default(),

    powerTarget: models.powerTarget.default(),
};

xf.create(db);

xf.reg(models.heartRate.prop, (heartRate, db) => {
    if(models.heartRate.validate(heartRate)) db.heartRate = heartRate;
    models.heartRate.onInvlid();
});

xf.reg(models.power.prop, (power, db) => {
    if(models.power.validate(power)) db.power = power;
    models.power.onInvlid();
});

xf.reg(models.powerTarget.prop, (powerTarget, db) => {
    if(models.powerTarget.validate(powerTarget)) db.powerTarget = powerTarget;
    db.powerTarget = models.powerTarget.toPowerTarget(powerTarget);
});

xf.sub('app:start', _ => {
    for(let model of models) {
        model.restore();
    }
});









// class ViewValue {
//     constructor(args) {
//         this.render = args.render || this.defaultRender();
//         this.init();
//     }
//     init() {
//         const self = this;
//         xf.sub(`${self.prop}`, self.onUpdate.bind(self));
//     }
//     onUpdate(value) {
//         const self = this;
//         if(equals(self.prev, value)) return;
//         self.render(value);
//         self.prev = value;
//     }
//     defaultValue() { return ''; }
//     defaultRender(value) {
//         const self = this;
//         console.log(`:${self.prop} ${value}`);
//     }
// }
