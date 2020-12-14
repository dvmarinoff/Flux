import { q } from './q.js';

let dom = {
    hrbConnectionScreen: {
        switchBtn: q.get('#hrb-connection-btn'),
        indicator: q.get('#hrb-connection-btn .indicator'),
    },
    controllableConnectionScreen: {
        switchBtn: q.get('#controllable-connection-btn'),
        indicator: q.get('#controllable-connection-btn .indicator'),
    },
    hrbSettings: {
        switchBtn:    q.get('#hrb-settings-btn'),
        indicator:    q.get('#hrb-settings-btn .indicator'),
        name:         q.get('#hrb-settings-name'),
        manufacturer: q.get('#hrb-settings-manufacturer'),
        model:        q.get('#hrb-settings-model'),
        firmware:     q.get('#hrb-settings-firmware'),
        value:        q.get('#hrb-settings-value'),
        battery:      q.get('#hrb-settings-battery'),
    },
    controllableSettings: {
        switchBtn:     q.get('#controllable-settings-btn'),
        indicator:     q.get('#controllable-settings-btn .indicator'),
        name:          q.get('#controllable-settings-name'),
        manufacturer:  q.get('#controllable-settings-manufacturer'),
        model:         q.get('#controllable-settings-model'),
        firmware:      q.get('#controllable-settings-firmware'),
        power:         q.get('#controllable-settings-power'),
        cadence:       q.get('#controllable-settings-cadence'),
        speed:         q.get('#controllable-settings-speed'),
    },
    datascreen: {
        time:      q.get('#time'),
        interval:  q.get('#interval-time'),
        targetPwr: q.get('#target-power'),
        power:     q.get('#power'),
        cadence:   q.get('#cadence'),
        speed:     q.get('#speed'),
        distance:  q.get('#distance'),
        heartRate: q.get('#heart-rate')
    },
    watch: {
        start:   q.get('#watch-start'),
        pause:   q.get('#watch-pause'),
        // resume:  q.get('#watch-resume'),
        lap:     q.get('#watch-lap'),
        stop:    q.get('#watch-stop'),
        save:    q.get('#activity-save'),
        workout: q.get('#start-workout'),
        cont:    q.get('#watch'),
        name:    q.get('#workout-name'),
    },
    controls: {
        resistanceMode:   q.get('#resistance-mode-btn'),
        slopeMode:        q.get('#slope-mode-btn'),
        ergMode:          q.get('#erg-mode-btn'),
        freeMode:         q.get('#free-mode-btn'),

        resistanceControls: q.get('#resistance-mode-controls'),
        slopeControls:      q.get('#slope-mode-controls'),
        ergControls:        q.get('#erg-mode-controls'),

        resistanceParams: q.get('#resistance-mode-params'),
        slopeParams:      q.get('#slope-mode-params'),
        ergParams:        q.get('#erg-mode-params'),

        resistanceValue:   q.get('#resistance-value'),
        resistanceInc:     q.get('#resistance-inc'),
        resistanceDec:     q.get('#resistance-dec'),
        // resistanceSet:     q.get('#resistance-set'),
        slopeValue:        q.get('#slope-value'),
        slopeInc:          q.get('#slope-inc'),
        slopeDec:          q.get('#slope-dec'),
        // slopeSet:          q.get('#slope-set'),


        targetPower:       q.get('#target-power-value'),
        workPower:         q.get('#work-power-value'),
        restPower:         q.get('#rest-power-value'),
        setTargetPower:    q.get('#set-target-power'),
        startWorkInterval: q.get('#start-work-interval'),
        startRestInterval: q.get('#start-rest-interval'),
    },
    settings: {
        ftp:        q.get('#ftp-value'),
        ftpBtn:     q.get('#ftp-btn'),
        weight:     q.get('#weight-value'),
        weightBtn:  q.get('#weight-btn'),
    },
    navigation: {
        menu:         q.get('.menu-cont'),
        tabBtns:      q.getAll('.menu .tab-btn'),
        pages:        q.getAll('.page'),
        homeBtn:      q.get('#home-tab-btn'),
        settingsBtn:  q.get('#settings-tab-btn'),
        workoutsBtn:  q.get('#workouts-tab-btn'),
        homePage:     q.get('#home-page'),
        settingsPage: q.get('#settings-page'),
        workoutsPage: q.get('#workouts-page'),
        controls:     q.get('.control-screen'),
    },
    file: {
        fileBtn: q.get('#workout-file'),
    },
    workouts: {
        workouts:     q.get('#workouts'),
        list:         q.get('#workouts .list'),
        items: [],
        select: [],
        descriptions: [],
    },
    activity: {
        saveBtn: q.get('#activity-save'),
    },
    graphWorkout: {
        // progress:  q.get('#progress'),
        name:      q.get('#current-workout-name'),
        graph:     q.get('#current-workout-graph'),
        intervals: [],
        steps: [],
    },
    // graphHr: {
    //     cont:  q.get('#graph-hr'),
    //     graph: q.get('#graph-hr .graph')
    // },
    graphPower: {
        cont:  q.get('#graph-power'),
        graph: q.get('#graph-power .graph'),
        ftp:   q.get('#ftp-line-value')
    },
    // recon: {
    //     section: q.get('#recon-cont'),
    //     cont:    q.get('#recon-graph'),
    //     graph:   q.get('#recon-graph .graph'),
    // }
};

export { dom };
