import { exists, empty, first, second, third, last, splitAt,
         evt, evtSource, evtProp, sub, dispatch, unsub,
         Store } from './functions.js';

describe('existance check', () => {
    describe('does not exist', () => {
        test('with Null', () => {
            expect(exists(null)).toBe(false);
        });
        test('with Undefined', () => {
            expect(exists(undefined)).toBe(false);
        });
    });

    describe('exists', () => {
        test('with Collection', () => {
            expect(exists({})).toBe(true);
            expect(exists([])).toBe(true);
            expect(exists("")).toBe(true);
            expect(exists(new Uint8Array([]))).toBe(true);
        });
        test('with Number', () => {
            expect(exists(0)).toBe(true);
        });
        test('with Boolean', () => {
            expect(exists(true)).toBe(true);
            expect(exists(false)).toBe(true);
        });
    });
});

describe('empty check', () => {
    describe('is empty', () => {
        test('with empty Array', () => {
            expect(empty([])).toBe(true);
        });
        test('with empty Object', () => {
            expect(empty({})).toBe(true);
        });
        test('with empty String', () => {
            expect(empty("")).toBe(true);
        });
        test('with undefined', () => {
            expect(empty(undefined)).toBe(true);
        });
    });

    describe('is not empty', () => {
        test('with Array', () => {
            expect(empty([0])).toBe(false);
        });
        test('with Object', () => {
            expect(empty({a: 0})).toBe(false);
        });
        test('with String', () => {
            expect(empty("zero")).toBe(false);
        });
    });

    describe('throws error', () => {
        test('with null', () => {
            expect(() => empty(null)).toThrow();
        });
        test('with number', () => {
            expect(() => empty(0)).toThrow();
        });
    });
});

describe('first element of collection', () => {
    describe('takes first element', () => {
        test('of Array', () => {
            expect(first([0])).toBe(0);
        });
        test('of String', () => {
            expect(first("zero")).toBe("z");
        });
    });

    describe('empty is undefined', () => {
        test('of Array', () => {
            expect(first([])).toBe(undefined);
        });
        test('of String', () => {
            expect(first("")).toBe(undefined);
        });
    });

    describe('first of undefined is undefined', () => {
        test('with undefined', () => {
            expect(first(undefined)).toBe(undefined);
        });
    });

    describe('throws error', () => {
        test('with number', () => {
            expect(() => first(0)).toThrow();
        });
        test('with null', () => {
            expect(() => first(null)).toThrow();
        });
    });
});

describe('second element of collection', () => {
    describe('takes second element', () => {
        test('of Array', () => {
            expect(second([0,1])).toBe(1);
        });
        test('of String', () => {
            expect(second("zero")).toBe("e");
        });
    });

    describe('index out of bound is undefined', () => {
        test('of Array', () => {
            expect(second([])).toBe(undefined);
        });
        test('of String', () => {
            expect(second("")).toBe(undefined);
        });
    });

    describe('empty is undefined', () => {
        test('of Array', () => {
            expect(second([])).toBe(undefined);
        });
        test('of String', () => {
            expect(second("")).toBe(undefined);
        });
    });

    describe('second of undefined is undefined', () => {
        test('with undefined', () => {
            expect(second(undefined)).toBe(undefined);
        });
    });

    describe('throws error', () => {
        test('with number', () => {
            expect(() => second(0)).toThrow();
        });
        test('with null', () => {
            expect(() => second(null)).toThrow();
        });
    });
});


describe('last element of Collection or String', () => {
    describe('works non-empty Collection or String', () => {
        test('with Array', () => {
            expect(last([0])).toBe(0);
            expect(last([0,2])).toBe(2);
            expect(last([0,1,4])).toBe(4);
        });
        test('with String', () => {
            expect(last('a')).toBe('a');
            expect(last('ab')).toBe('b');
            expect(last('abcd')).toBe('d');
            expect(last('1')).toBe('1');
        });
    });

    describe('empty Collection or String is undefined', () => {
        test('with Array', () => {
            expect(last([])).toBe(undefined);
        });
        test('with String', () => {
            expect(last('')).toBe(undefined);
        });
    });

    describe('last of undefined is undefined', () => {
        test('with undefined', () => {
            expect(second(undefined)).toBe(undefined);
        });
    });

    describe('throws error', () => {
        test('with number', () => {
            expect(() => last(0)).toThrow();
        });
        test('with null', () => {
            expect(() => last(null)).toThrow();
        });
    });
});


describe('split array at value', () => {
    describe('empty array is identity', () => {
        test('with []', () => {
            expect(splitAt([], 0)).toEqual([]);
        });
    });
    describe('one element array', () => {
        test('spliter not found', () => {
            expect(splitAt([0], 1)).toEqual([[0]]);
        });
        test('spliter found', () => {
            expect(splitAt([0], 0)).toEqual([[0]]);
        });
    });
    describe('splits to arrays', () => {
        test('spliter not found', () => {
            expect(splitAt([0,1,2], 3)).toEqual([ [0,1,2] ]);
        });
        test('spliter found once at start', () => {
            expect(splitAt([0,1,2], 0)).toEqual([ [0,1,2] ]);
        });
        test('spliter found once in the middle', () => {
            expect(splitAt([0,1,2], 1)).toEqual([ [0], [1,2] ]);
        });
        test('spliter found once at end', () => {
            expect(splitAt([0,1,2], 2)).toEqual([ [0,1], [2] ]);
        });
    });
    describe('multiple spliters found', () => {
        test('symmetric message', () => {
            expect(splitAt([0,1,2,0,1,2,0,1,2], 0)).toEqual([ [0,1,2], [0,1,2], [0,1,2] ]);
        });
        test('variable size message', () => {
            expect(splitAt([0,1,2,0,0,1,2], 0)).toEqual([ [0,1,2], [0], [0,1,2] ]);
        });
        test('variable size message with non-split start', () => {
            expect(splitAt([1,2,0,0,1,2], 0)).toEqual([ [1,2], [0], [0,1,2] ]);
        });
    });
});

describe('Creates Custom Event', () => {
    const e = evt(`db:weight`)(74);

    test('sets name as event type', () => {
        expect(e.type).toBe('db:weight');
    });
    test('sets value as event data', () => {
        expect(e.detail.data).toBe(74);
    });
});

describe('Source of Custom Event', () => {
    const e = evt(`db:weight`)(74);

    test('gets source', () => {
        expect(evtSource(e.type)).toBe('db');
    });
});

describe('Sub for Custom Event', () => {
    const defaultWeight = 0;
    let weight = defaultWeight;
    function onUpdate(value) { weight = value; }

    sub(`test:weight`, onUpdate);

    test('sub executes handler', () => {
        expect(weight).toBe(defaultWeight);
        dispatch(`test:weight`, 74);
        expect(weight).toBe(74);
    });

    unsub(`test:weight`, onUpdate, true);
});


describe('Store', () => {
    var initDB = { x: 0 };
    var db = new Store({db: initDB});
    db.reg(`set:x`, (x, db) => { db.x = x; });

    test('create Store', () => {
        expect(db.get('x')).toBe(0);
    });

    test('update Store', () => {
        dispatch(`set:x`, 180);
        expect(db.get('x')).toBe(180);
    });
});
