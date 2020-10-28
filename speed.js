import { sin,
         cos,
         arctan,
         abs,
         sqr,
         exp,
         mps,
         kph,
         avg } from './functions.js';

function rho(temp, elevation) {
    return (1.293 - 0.00426 * temp) * exp(elevation / 7000);
};

function forceGravity(args) {
    return args.g * sin(arctan(0.01 * args.grade))*args.totalWeight;
}
function forceRolling(args) {
    return args.g * cos(arctan(0.01 * args.grade))*args.totalWeight*args.crr;
}
function dragConst(args) {
    return 0.5 * args.cda * args.rho;
}
function forceWind(dragConst, velocity) {
    // returns wind force in N
    let v = mps(velocity);
    return dragConst * (v * v);
}
function powerWind(dragConst, velocity) {
    // returns wind power in W
    let v = mps(velocity);
    return dragConst * (v * v * v);
}

function newton(f, fprime, guess = 20, iter = 10, epsilon = 0.05) {
		for (let i = 1; i < iter; i++) {
			  let nextGuess = guess - f(guess) / fprime(guess);
			  if (abs(nextGuess - guess) < epsilon) {
            return nextGuess;
        }
			  guess = nextGuess;
		}
		return 0;
}

function speedFromPower(power, env) {
    let Fg = forceGravity(env);
    let Fr = forceRolling(env);
    let dc = dragConst(env);
    let s = 0;

    let f = x => ((Fg + Fr + dc * sqr(x)) * x) - power;
    let fprime = x => 3 * dc * sqr(x) + Fr + Fg;

    if(power > 0) {
        s = kph(newton(f, fprime));
    }

    // console.log(`g: ${Fg}, crr: ${Fr}, wind: ${powerWind(dc, s)}, speed: ${s}`);
    return s;
}

export { speedFromPower, powerWind };

