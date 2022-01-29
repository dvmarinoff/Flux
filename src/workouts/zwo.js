import { equals, existance, exists, empty, repeat, capitalize } from '../functions.js';
import { toDecimalPoint, divisors } from '../utils.js';

function readAttribute(args = {}) {
    const defaults = {
        transform: ((x) => x),
        fallback:  0,
    };

    let el        = args.el;
    let name      = args.name;
    let value     = existance(args.fallback, defaults.fallback);
    let transform = existance(args.transform, defaults.transform);

    if(el.hasAttribute(name)) {
        value = el.getAttribute(name);
        return transform(value);
    } else {
        return undefined;
    }
}

function writeAttribute(args = {}) {
    let name  = existance(args.name);
    let value = existance(args.value);
    let attr  = `${name}="${value}"`;

    return attr;
}

function Attribute(args = {}) {
    const defaults = {
        name:      '',
        transform: ((x) => x),
    };

    const name      = existance(args.name, defaults.name);
    const transform = existance(args.transform, defaults.transform);

    function getName() {
        return name;
    }

    function read(args = {}) {
        const el = existance(args.el);
        return readAttribute({el, name, transform});
    }

    function write(args = {}) {
        const value = transform(existance(args.value));
        return writeAttribute({name, value});
    }

    return Object.freeze({
        getName,
        read,
        write,
    });
}

function attributesToStep(args = {}) {
    const tag    = existance(args.element);
    const filter = existance(args.filter, ((_) => true));
    const toName = existance(args.toName, ((x) => x));

    return Object.keys(tag).reduce(function(acc, key) {
        if(filter(key)) {
            const name  = toName(key);
            const value = tag[key];
            acc[name] = value;
        }
        return acc;
    }, {});
}

function Step(element) {
    const spec = {
        element: element,
        filter:  (key) => !equals(key, 'element'),
        toName:  (key) => key.toLowerCase(),
    };

    return attributesToStep(spec);
}

function OnStep(element) {
    const spec = {
        element:    element,
        filter: (key) => key.startsWith('On') || equals(key, 'Cadence'),
        toName: (key) => key.replace(/On/g,'').toLocaleLowerCase(),
    };

    return attributesToStep(spec);
}

function OffStep(element) {
    const spec = {
        element:    element,
        filter: (key) => key.startsWith('Off') || key.endsWith('Resting'),
        toName: (key) => key.replace(/On|Off|Resting/g,'').toLocaleLowerCase(),
    };

    return attributesToStep(spec);
}

function Element(args = {}) {
    const defaults = {
        name:     'Unknown',
        tagOpen:  '<Unknown',
        tagClose: ' />',
        content:  '',
    };

    const name         = existance(args.name, defaults.name);
    const tagOpen      = existance(args.tagOpen, defaults.tagOpen);
    const tagClose     = existance(args.tagClose, defaults.tagClose);
    const toInterval   = existance(args.toInterval, defaultToInterval);
    const calcDuration = existance(args.calcDuration, defaultCalcDuration);

    function getName() {
        return name;
    }

    function readContent(el) {
        if(exists(el)) {
            let value = el.textContent;
            if(empty(value)) {
                return undefined;
            } else {
                return value;
            }
        }

        return undefined;
    }

    function read(args = {}) {
        const el            = existance(args.el);
        const attrsNodeList = el.attributes || [];
        const length        = attrsNodeList.length;

        let acc = {element: name};

        for(let i = 0; i < length; i++) {
            const name   = attrsNodeList[i].name;
            const attrFn = Attrs[name];
            const key    = name;
            let value    = attrsNodeList[i].value;

            if(exists(attrFn)) {
                value = attrFn.read({el});
            }

            acc[key] = value;
        }

        return acc;
    }

    function write(args = {}) {
        let { content, ...attributes } = args;

        content = existance(args.content, defaults.content);

        const attrsString = Object.keys(attributes).reduce((acc, key) => {
            acc += ` ${key}="${args[key]}"`;
            return acc;
        }, '');

        return `${tagOpen + attrsString}${content}${tagClose}`;
    }

    function defaultCalcDuration(element) {
        const duration = element.Duration;
        return duration;
    }

    function defaultToInterval(element) {
        const duration = calcDuration(element);
        const step = Step(element);

        return {
            duration: duration,
            steps:    [step],
        };
    }

    function readToInterval(args = {}) {
        return toInterval(read(args));
    }

    return Object.freeze({
        getName,
        readContent,
        read,
        write,
        toInterval,
        calcDuration,
        defaultCalcDuration,
        defaultToInterval,
        readToInterval,
    });
}

function IntervalsT(args = {}) {
    const spec = {
        name:         'IntervalsT',
        tagOpen:      '<IntervalsT',
        tagClose:     ' />',
        toInterval:   toInterval,
        calcDuration: calcDuration,
    };

    function calcDuration(element) {
        return element.Repeat * (element.OnDuration + element.OffDuration);
    }

    function toInterval(element) {
        const duration   = calcDuration(element);
        const stepsCount = existance(element.Repeat, 1);

        const onStep  = OnStep(element);
        const offStep = OffStep(element);
        const steps   = repeat(stepsCount)(function(acc) {
            acc.push({duration: onStep.duration, steps: [onStep]});
            acc.push({duration: offStep.duration, steps: [offStep]});
            return acc;
        })([]);

        return steps;
    }

    return Element(spec);
}

function Unknown(args = {}) {
    const spec = {
        name:     'Unknown',
        tagOpen:  '<Unknown',
        tagClose: ' />',
    };

    // console.warn(`Unknown Element in .zwo workout: ${args.el}`);

    return Element(spec);
}

function FreeRide(args = {}) {
    const spec = {
        name:     'FreeRide',
        tagOpen:  '<FreeRide',
        tagClose: ' />',
        toInterval: toInterval,
    };

    function toInterval(element) {
        const duration = element.Duration;
        const power    = 0;
        const slope    = 0;

        return {
            duration: duration,
            steps: [{
                duration: duration,
                slope: slope,
                power: power
            }],
        };
    }

    return Element(spec);
}

function Warmup(args = {}) {
    const defaults = {
        timeDx: 10,
    };

    const timeDx = existance(args.timeDx, defaults.timeDx);

    const spec = Object.assign({
        name:       'Warmup',
        tagOpen:    '<Warmup',
        tagClose:   ' />',
        toInterval: toInterval,
    }, args.spec);

    function toInterval(element) {
        const duration  = element.Duration;
        const powerLow  = element.PowerLow;
        const powerHigh = element.PowerHigh;

        const stepsCount = parseInt(duration / timeDx);
        const powerDx    = (powerHigh - powerLow) / (stepsCount - 1);

        let steps     = [];
        let stepPower = powerLow;

        for(let i = 0; i < stepsCount; i++) {
            steps.push({duration: timeDx, power: stepPower});
            stepPower = (stepPower + powerDx);
        }

        const fixedSteps = steps.map((step) => {
            step.power = toDecimalPoint(step.power, 2);
            return step;
        });

        return {
            duration: duration,
            steps: fixedSteps,
        };
    }

    return Element(spec);
}

function Cooldown(args = {}) {
    const defaults = {
        timeDx: 10,
    };

    const timeDx = existance(args.timeDx, defaults.timeDx);

    const spec = {
        name:       'Cooldown',
        tagOpen:    '<Cooldown',
        tagClose:   ' />',
        toInterval: toInterval,
    };

    function toInterval(element) {
        const duration  = element.Duration;
        const powerLow  = element.PowerHigh;
        const powerHigh = element.PowerLow;

        const stepsCount = parseInt(duration / timeDx);
        const powerDx    = (powerHigh - powerLow) / (stepsCount - 1);

        let steps     = [];
        let stepPower = powerHigh;

        for(let i = 0; i < stepsCount; i++) {
            steps.push({duration: timeDx, power: stepPower});
            stepPower = (stepPower - powerDx);
        }

        const fixedSteps = steps.map((step) => {
            step.power = toDecimalPoint(step.power, 2);
            return step;
        });

        return {
            duration: duration,
            steps: fixedSteps,
        };
    }

    return Element(spec);
}

function Ramp(args = {}) {
    const spec = {
        name:       'Ramp',
        tagOpen:    '<Ramp',
        tagClose:   ' />',
    };

    return Warmup(spec);
}

function readContent(el) {
    if(exists(el)) {
        let value = el.textContent;
        if(empty(value)) {
            return undefined;
        } else {
            return value;
        }
    }
    return undefined;
}

function Head(args = {}) {
    const defaults = {
        author:      'Unknown',
        name:        'Custom',
        description: 'Custom',
        category:    'Custom',
        subcategory: '',
        sportType:   'bike',
        tags:        '',
    };

    function read(args = {}) {
        const doc = existance(args.doc);

        const author      = readContent(doc.querySelector('author'));
        const name        = readContent(doc.querySelector('name'));
        const description = readContent(doc.querySelector('description'));
        const category    = readContent(doc.querySelector('category'));
        const subcategory = readContent(doc.querySelector('subcategory'));
        const sportType   = readContent(doc.querySelector('sportType'));

        return {
            author:      existance(author, defaults.author),
            name:        existance(name, defaults.name),
            description: existance(description, defaults.description),
            category:    existance(category, defaults.category),
            subcategory: existance(subcategory, defaults.subcategory),
            sportType:   existance(sportType, defaults.sportType),
        };
    }

    function write(args = {}) {
        const author      = existance(args.author, defaults.author);
        const name        = existance(args.name, defaults.name);
        const description = existance(args.description, defaults.description);
        const sportType   = existance(args.sportType, defaults.sportType);
        const category    = existance(args.category, defaults.category);
        const subcategory = existance(args.subcategory, defaults.subcategory);
        const tags        = existance(args.tags, defaults.tags);

        return `
            ${Elements.Author.write({content: author})}
            ${Elements.Name.write({content: name})}
            ${Elements.Category.write({content: category})}
            ${Elements.SubCategory.write({content: subcategory})}
            ${Elements.Description.write({content: description})}
            ${Elements.SportType.write({content: sportType})}
            ${Elements.Tags.write({content: tags})}`
        ;
    }

    return Object.freeze({
        read,
        write,
    });
}

function Body() {
    const defaults = {
        parent: 'workout',
    };

    const parent = defaults.parent;

    function apply(el, method = 'read') {
        const name = el.tagName;

        if(exists(Elements[name])) {
            return Elements[name][method]({el});
        }

        return Elements.Unknown[method]({el});
    }

    function queryElements(doc) {
        const workoutEl = doc.querySelector(parent);
        const elements  = Array.from(workoutEl.children);
        return elements;
    }

    function read(args = {}) {
        const doc = existance(args.doc);
        const elements = queryElements(doc);
        return elements.map((el) => apply(el, 'read'), []);
    }

    function readToInterval(args = {}) {
        const doc = existance(args.doc);
        const elements = queryElements(doc);
        return elements.flatMap((el) => apply(el, 'readToInterval'), []);
    }

    function writeElement(args = {}) {
        const { element, ...spec } = args;

        if(exists(Elements[element])) {
            return Elements[element].write(spec);
        }

        return Elements.Unknown.write(spec);
    }

    function writeElements(elements) {
        return elements.reduce((acc, element) => acc + writeElement(element), '');
    }

    function write(args = {}) {
        return `<workout>${writeElements(args)}</workout>`;
    }

    return Object.freeze({
        read,
        readToInterval,
        write,
    });
}

const Attrs = {
    Duration:    Attribute({name: 'Duration', transform: parseInt}),
    OnDuration:  Attribute({name: 'OnDuration', transform: parseInt}),
    OffDuration: Attribute({name: 'OffDuration', transform: parseInt}),

    Power:     Attribute({name: 'Power', transform: parseFloat}),
    OnPower:   Attribute({name: 'OnPower', transform: parseFloat}),
    OffPower:  Attribute({name: 'OffPower', transform: parseFloat}),
    PowerLow:  Attribute({name: 'PowerLow', transform: parseFloat}),
    PowerHigh: Attribute({name: 'PowerHigh', transform: parseFloat}),

    Cadence:        Attribute({name: 'Cadence', transform: parseInt}),
    CadenceLow:     Attribute({name: 'CadenceLow', transform: parseInt}),
    CadenceHigh:    Attribute({name: 'CadenceHigh', transform: parseInt}),
    CadenceResting: Attribute({name: 'CadenceResting', transform: parseInt}),

    Slope:     Attribute({name: 'Slope', transform: parseFloat}),
    OnSlope:   Attribute({name: 'OnSlope', transform: parseFloat}),
    OffSlope:  Attribute({name: 'OffSlope', transform: parseFloat}),
    SlopeLow:  Attribute({name: 'SlopeLow', transform: parseFloat}),
    SlopeHigh: Attribute({name: 'SlopeHigh', transform: parseFloat}),

    Repeat: Attribute({name: 'Repeat', transform: parseInt}),
};

const Elements = {
    Warmup:      Warmup(),
    SteadyState: Element({name: 'SteadyState', tagOpen: '<SteadyState', tagClose: ' />'}),
    IntervalsT:  IntervalsT(),
    FreeRide:    FreeRide(),
    Ramp:        Ramp(),
    Cooldown:    Cooldown(),
    Unknown:     Unknown(),
    Author:      Element({name: 'author', tagOpen: '<author>', tagClose: '</author>'}),
    Name:        Element({name: 'name', tagOpen: '<name>', tagClose: '</name>'}),
    Category:    Element({name: 'category', tagOpen:  '<category>', tagClose: '</category>'}),
    SubCategory: Element({name: 'subcategory', tagOpen:  '<subcategory>', tagClose: '</subcategory>'}),
    Description: Element({name: 'description', tagOpen: '<description>', tagClose: '</description>'}),
    SportType:   Element({name: 'sporttype', tagOpen:  '<sporttype>', tagClose: '</sporttype>'}),
    Tags:        Element({name: 'tags', tagOpen: '<tags>', tagClose: '</tags>'}),
};

const head = Head();
const body = Body();

const parser    = new DOMParser();

function readToInterval(zwo) {
    const doc       = parser.parseFromString(zwo, 'text/xml');
    const meta      = head.read({doc});
    const intervals = body.readToInterval({doc});
    const duration  = intervals.reduce((acc, i) => acc + i.duration, 0);

    return {
        meta:      Object.assign(meta, {duration}),
        intervals: intervals,
    };
}

function read(zwo) {
    const doc          = parser.parseFromString(zwo, 'text/xml');
    const headElements = head.read({doc});
    const bodyElements = body.read({doc});

    return {
        head: headElements,
        body: bodyElements,
    };
}

function write(args = {}) {
    const headElements = head.write(args.head);
    const bodyElements = body.write(args.body);

    return `
    <workout_file>
        ${headElements}
        ${bodyElements}
    </workout_file>`;
}

const zwo = {
    readAttribute,
    writeAttribute,
    Attribute,
    Attrs,
    Element,
    Elements,

    attributesToStep,
    Step,
    OnStep,
    OffStep,

    head,
    body,
    readToInterval,
    read,
    write,
};

export { zwo };
