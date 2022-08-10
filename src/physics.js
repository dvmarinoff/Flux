
// Qubic
// Source: https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
function Qubic(a, b, c, d) {
    if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
            a = b; b = c;
            if (Math.abs(a) < 1e-8) // Degenerate case
                return [];
            return [-b/a];
        }

        var D = b*b - 4*a*c;
        if (Math.abs(D) < 1e-8)
            return [-b/(2*a)];
        else if (D > 0)
            return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
        return [];
    }

    // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
    var p = (3*a*c - b*b)/(3*a*a);
    var q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
    var roots;
    if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
        roots = [Math.cbrt(-q)];
    } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
        roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
    } else {
        D = q*q/4 + p*p*p/27;
        if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
            roots = [-1.5*q/p, 3*q/p];
        } else if (D > 0) {             // Only one real root
            var u = Math.cbrt(-q/2 - Math.sqrt(D));
            roots = [u - p/(3*u)];
        } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
            u = 2*Math.sqrt(-p/3);
            var t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
            var k = 2*Math.PI/3;
            roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
        }
    }
    // Convert back from depressed cubic
    for (var i = 0; i < roots.length; i++) {
        roots[i] -= b/(3*a);
    }

    return roots;
}
// end Qubic

// Original
// written in VBA by GCUser based on Validation of a Mathematical Model for Road Cycling Power, Martin et al
// dynamic rolling resistance based on http://www.kreuzotter.de/english/espeed.htm#forml
function calcVel(power, slope = 0, mass = 85, crr = 0.004, cda = 0.4, rhoAir = 1, lossDt = 0, vWind = 0, wheelCircumference = 2000, accel = 0,
                 modelSpokeDrag = false, modelBearingLoss = false, modelWheelInertia = false, modelDynRollRes = false, smallAngleApprox = false) {
    const pi = Math.PI; // 4 * Math.atan(1);
    const g = 9.80665;

    let cosBeta = 0;
    let sinBeta = 0;
    if(smallAngleApprox) {
        cosBeta = 1;
        sinBeta = slope;
    } else {
        cosBeta = 1 / Math.sqrt(slope * slope + 1); // Math.cos(Math.atan(slope))
        sinBeta = slope * cosBeta;                  // Math.sin(Math.atan(slope))
    }

    let mwheel = 0;
    if(modelWheelInertia) {
        const r = wheelCircumference / (2000 * pi);
        const i = 0.14;
        mwheel = i / (Math.pow(r, 2)); // r^2
    }

    const fw   = modelSpokeDrag   ? 0.0044 : 0;
    const c1bl = modelBearingLoss ? 0.091  : 0;
    const c2bl = modelBearingLoss ? 0.0087 : 0;
    const crv  = modelDynRollRes  ? 0.1    : 0;

    const c1ke      = (mass + mwheel) * accel;
    const c1grav    = g * mass * sinBeta;
    const c1roll    = g * mass * crr * cosBeta;
    const c1air     = 0.5 * (cda + fw) * rhoAir * (Math.pow(vWind, 2)); // vWind ^ 2
    const c2air     = (cda + fw) * rhoAir * vWind;
    const c2dynroll = crv * cosBeta;
    const c3air     = 0.5 * (cda + fw) * rhoAir;

    const c0 = -power * (1 - lossDt);
    const c1 = c1grav + c1roll + c1air + c1bl + c1ke;
    const c2 = c2air + c2bl + c2dynroll;
    const c3 = c3air;

    const roots = Qubic(c3, c2, c1, c0); // roots = Qubic(c2 / c3, c1 / c3, c0 / c3);

    let velocity = roots[0]; // original index is 1, maybe it's 0
    let thisVelocity;

    for(var root of roots) {
        thisVelocity = root;
        if(velocity > 0) {
            if((thisVelocity > 0) && (thisVelocity < velocity)) {
                velocity = thisVelocity;
            }
        } else {
            if(thisVelocity > velocity) {
                velocity = thisVelocity;
            }
        }
    }

    return velocity;
}

function calcPower(velocity, slope, mass, crr = 0.004, cda = 0.4, rhoAir = 1, lossDt = 0, vWind = 0, wheelCircumference = 2000, accel = 0,
                   modelSpokeDrag = false, modelBearingLoss = false, modelWheelInertia = false, modelDynRollRes = false, smallAngleApprox = false) {
    const pi = Math.PI; // 4 * Math.atan(1)
    const g  = 9.80665; // exact grav accel

    let cosBeta = 0;
    let sinBeta = 0;
    if(smallAngleApprox) {
        cosBeta = 1;
        sinBeta = slope;
    } else {
        cosBeta = 1 / Math.sqrt(slope * slope + 1); // Math.cos(Math.atan(slope))
        sinBeta = slope * cosBeta;                  // Math.sin(Math.atan(slope))
    }

    let mwheel = 0;
    if(modelWheelInertia) {
        let r = wheelCircumference / (2000 * pi);
        let i = 0.14; // moment of inertia of wheels (kg*m^2)
        mwheel = i / (Math.pow(r, 2));
    }

    const fw  = modelSpokeDrag  ? 0.0044 : 0; // incremental drag associated with area of spokes in m^2
    const crv = modelDynRollRes ? 0.1    : 0;

    const pgrav    = (g * mass * sinBeta) * velocity;
    const proll    = (g * crr * mass * cosBeta) * velocity;
    const pair     = 0.5 * (cda + fw) * rhoAir * (Math.pow((velocity + vWind), 2)) * velocity;
    const pdynroll = (velocity * crv * cosBeta) * velocity;
    const pke      = (mass + mwheel) * accel * velocity;

    const pwbearing = modelBearingLoss ? (0.091 * velocity + 0.0087 * Math.pow(velocity, 2)) : 0;

    return (pgrav + proll + pair + pke + pwbearing + pdynroll) / (1 - lossDt);
}
// end Original

// Usage:
// var v = calcVel(200, 0.00, 75 + 10, 0.00330, 0.5, 1.225, 0.02, 0, 2105, 0, true, true, true, true, true) * 3.6 -> 29.251301130884464
// calcPower(v /3.6, 0.00, 75 + 10, 0.00330, 0.5, 1.225, 0.02, 0, 2105, 0, true, true, true, true, true) -> 200.00000000003962

// var v = calcVel(200, 0.00, 75 + 10, 0.00330, 0.5, 1.225, 0.02, 0, 2105, 0, true, true, true, true, true) * 3.6;
// p = calcPower(v/3.6, 0.00, 75 + 10, 0.00330, 0.5, 1.225, 0.02, 0, 2105, 0, true, true, true, true, true);

function Model(args = { use: {}}) {
    const defaults = {
        mass: 85,
        slope: 0,
        wheelCircumference: 2105,

        drivetrainLoss: 0.02,
        crr: 0.004,
        windSpeed: 0,
        rho:             1.275,
        dragCoefficient: 1.0,
        frontalArea:     0.4,
        CdA:             0.4,
        draftingFactor:  1,

        use: {
            spokeDrag: false,
            bearingLoss: false,
            wheelInertia: false,
            useDynamicCrr: false,
        }
    };

    const pi = Math.PI;
    const g  = 9.80665;

    const wheelCircumference = args.wheelCircumference ?? defaults.wheelCircumference;

    const drivetrainLoss = args.drivetrainLoss ?? defaults.drivetrainLoss;
    const crr = args.crr ?? defaults.crr;
    const rho = args.rho ?? defaults.rho;
    const CdA = args.CdA ?? defaults.CdA;

    const use = Object.assign(defaults.use, args.use);

    function CosBeta(slope) {
        return 1 / Math.sqrt(slope * slope + 1);
    }

    function SinBeta(slope, cosBeta) {
        return slope * cosBeta;
    }

    function calcWheelInertia(wheelCircumference, useWheelInertia = false) {
        if(useWheelInertia) {
            const r = wheelCircumference / (2000 * pi);
            const i = 0.14;
            return (i / (Math.pow(r, 2)));
        }
        return 0;
    }

    const wheelInertia  = calcWheelInertia(wheelCircumference, use.wheelInertia);
    const spokeDrag     = use.spokeDrag   ? 0.0044 : 0;
    const c1bearingLoss = use.bearingLoss ? 0.091  : 0;
    const c2bearingLoss = use.bearingLoss ? 0.0087 : 0;
    const crv           = use.dynamicCrr  ? 0.1    : 0;

    function powerToMaxSpeed(args = {}) {
        const power          = args.power;
        const slope          = args.slope ?? defaults.slope;
        const mass           = args.mass ?? defaults.mass;
        const windSpeed      = args.windSpeed ?? defaults.windSpeed;
        const acceleration   = args.acceleration ?? 0;
        const drivetrainLoss = args.drivetrainLoss ?? 0; //defaults.drivetrainLoss;
        const draftingFactor = args.draftingFactor ?? defaults.draftingFactor;

        const cosBeta = CosBeta(slope);
        const sinBeta = SinBeta(slope, cosBeta);

        const c1KE   = (mass + wheelInertia) * acceleration;
        const c1Grav = g * mass * sinBeta;
        const c1Roll = g * mass * crr * cosBeta;
        const c1Air  = 0.5 * (CdA + spokeDrag) * rho * (Math.pow(windSpeed, 2));

        const c2Air        = (CdA + spokeDrag) * rho * windSpeed;
        const c2DynamicCrr = crv * cosBeta;

        const c3Air = 0.5 * (CdA + spokeDrag) * rho;

        const c0 = -power * (1 - drivetrainLoss);
        const c1 = c1Grav + c1Roll + c1Air + c1bearingLoss + c1KE;
        const c2 = c2Air + c2bearingLoss + c2DynamicCrr;
        const c3 = c3Air;

        const roots = Qubic(c3, c2, c1, c0);

        let velocity = roots[0];

        for(var root of roots) {
            if(velocity > 0) {
                if((root > 0) && (root < velocity)) {
                    velocity = root;
                }
            } else {
                if(root > velocity) {
                    velocity = root;
                }
            }
        }

        return velocity;
    }

    function virtualSpeed(args = {}) {
        const power          = args.power; // W
        const slope          = args.slope ?? defaults.slope; // 0.01 is 1%
        const mass           = args.mass ?? defaults.mass; // kg
        const windSpeed      = args.windSpeed ?? 0; // m/s
        const drivetrainLoss = args.drivetrainLoss ?? 0;
        const draftingFactor = args.draftingFactor ?? defaults.draftingFactor; // 0..1
        const dt             = args.dt ?? 1; // s
        const speedPrev      = args.speed ?? 0; // m/s
        let speed            = args.speed ?? 0; // m/s
        let distance         = args.distance ?? 0; // m
        let altitude         = args.altitude ?? 0; // m

        const cosBeta = CosBeta(slope);
        const sinBeta = SinBeta(slope, cosBeta);

        const gravitationalResistance = g * mass * sinBeta;
        const rollingResistance       = g * mass * cosBeta * crr + speedPrev * crv * cosBeta;
        const windResistance          = 0.5 * rho * (CdA + spokeDrag) * Math.pow((speed + windSpeed), 2) * draftingFactor;
        const bearingLossResistance   = use.bearingLoss ? (0.091  + 0.0087 * speedPrev) : 0;
  	    const keResistance            = 0;

        const totalResistance =
              gravitationalResistance +
              rollingResistance +
              windResistance +
              bearingLossResistance +
              keResistance;
        const powerSteadyState = totalResistance * speedPrev;
        const powerKE = (power * (1 - drivetrainLoss)) - powerSteadyState;

        speed = Math.sqrt(Math.pow(speedPrev, 2) + 2 * powerKE * dt / (mass + wheelInertia));
        if(speed < 0 || isNaN(speed)) speed = 0;

        const acceleration = (speed - speedPrev) / dt;
        const dx = speed * dt;
        const da = dx * sinBeta;
        distance += dx;
        altitude += da;

        if(altitude < 0) altitude = 0;

        return { acceleration, speed, distance, altitude };
    }

    function virtualSpeedCF(args = {}) {
        const power          = args.power; // W
        const slope          = args.slope ?? defaults.slope; // 0.01 is 1%
        const mass           = args.mass ?? defaults.mass; // kg
        const windSpeed      = args.windSpeed ?? 0; // m/s
        const drivetrainLoss = args.drivetrainLoss ?? 0;
        const draftingFactor = args.draftingFactor ?? defaults.draftingFactor; // 0..1
        const dt             = args.dt ?? 1; // s
        const speedPrev      = args.speed ?? 0; // m/s
        let speed            = args.speed ?? 0; // m/s
        let distance         = args.distance ?? 0; // m
        let altitude         = args.altitude ?? 0; // m
        let ascent           = args.ascent ?? 0; // m

        const cosBeta = CosBeta(slope);
        const sinBeta = SinBeta(slope, cosBeta);

        const c1bl = c1bearingLoss;
        const c2bl = c2bearingLoss;
        // set to zero for no pke modeling, one for full pke modeling
        const pkefactor = 0.25;

        const c0ke      = -0.5 * (mass + wheelInertia) * Math.pow(speedPrev, 2) * pkefactor / dt;
        const c2ke      =  0.5 * (mass + wheelInertia) * pkefactor / dt;
        const c1grav    = g * mass * sinBeta;
        const c1roll    = g * mass * crr * cosBeta;
        const c1air     = 0.5 * (CdA + spokeDrag) * rho * (Math.pow(windSpeed, 2)) * draftingFactor;
        const c2air     = (CdA + spokeDrag) * rho * windSpeed * draftingFactor;
        const c2dynroll = crv * cosBeta;
        const c3air     = 0.5 * (CdA + spokeDrag) * rho * draftingFactor;

        const c0 = -power * (1 - drivetrainLoss) + c0ke;
        const c1 = c1grav + c1roll + c1air + c1bl;
        const c2 = c2air + c2bl + c2dynroll + c2ke;
        const c3 = c3air;

        const roots = Qubic(c3, c2, c1, c0);

        speed = roots[0];

        let thisSpeed;
        for(var root of roots) {
            thisSpeed = root;
            if(speed > 0) {
                if((thisSpeed > 0) && (thisSpeed < speed)) {
                    speed = thisSpeed;
                }
            } else {
                if(thisSpeed > speed) {
                    speed = thisSpeed;
                }
            }
        }

        if(speed < 0.1 || isNaN(speed)) speed = 0;

        const acceleration = (speed - speedPrev) / dt;
        const dx = speed * dt;
        const da = dx * sinBeta;
        distance += dx;
        altitude += da;
        ascent += da > 0 ? da : 0;

        if(altitude < 0) altitude = 0;

        return {
            acceleration,
            speed,
            distance,
            altitude,
            ascent,
        };
    }

    function trainerSpeed(args = {}) {
        const slope          = args.slope ?? defaults.slope; // 0.01 is 1%
        const dt             = args.dt ?? 1; // s
        const speedPrev      = args.speedPrev ?? 0; // m/s
        let speed            = args.speed ?? 0; // m/s
        let distance         = args.distance ?? 0; // m
        let altitude         = args.altitude ?? 0; // m
        let ascent           = args.ascent ?? 0; // m

        const cosBeta = CosBeta(slope);
        const sinBeta = SinBeta(slope, cosBeta);

        const acceleration = (speed - speedPrev) / dt;
        const dx = speed * dt;
        const da = dx * sinBeta;
        distance += dx;
        altitude += da;
        ascent += da > 0 ? da : 0;

        if(altitude < 0) altitude = 0;

        return {
            acceleration,
            distance,
            altitude,
            ascent,
        };
    }

    return Object.freeze({
        powerToMaxSpeed,
        virtualSpeed,
        virtualSpeedCF,
        trainerSpeed,
    });
}


export { Model };

