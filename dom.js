let dom = {
    hrbConnectionScreen: {
        switchBtn: document.querySelector('#hrb-connection-btn'),
        indicator: document.querySelector('#hrb-connection-btn .indicator'),
    },
    controllableConnectionScreen: {
        switchBtn: document.querySelector('#controllable-connection-btn'),
        indicator: document.querySelector('#controllable-connection-btn .indicator'),
    },
    hrbSettings: {
        switchBtn:    document.querySelector('#hrb-settings-btn'),
        indicator:    document.querySelector('#hrb-settings-btn .indicator'),
        name:         document.querySelector('#hrb-settings-name'),
        manufacturer: document.querySelector('#hrb-settings-manufacturer'),
        model:        document.querySelector('#hrb-settings-model'),
        firmware:     document.querySelector('#hrb-settings-firmware'),
        value:        document.querySelector('#hrb-settings-value'),
        battery:      document.querySelector('#hrb-settings-battery'),
    },
    controllableSettings: {
        switchBtn:     document.querySelector('#controllable-settings-btn'),
        indicator:     document.querySelector('#controllable-settings-btn .indicator'),
        name:          document.querySelector('#controllable-settings-name'),
        manufacturer:  document.querySelector('#controllable-settings-manufacturer'),
        model:         document.querySelector('#controllable-settings-model'),
        firmware:      document.querySelector('#controllable-settings-firmware'),
        power:         document.querySelector('#controllable-settings-power'),
        cadence:       document.querySelector('#controllable-settings-cadence'),
        speed:         document.querySelector('#controllable-settings-speed'),
    },
    datascreen: {
        time:      document.querySelector('#time'),
        interval:  document.querySelector('#interval-time'),
        targetPwr: document.querySelector('#target-power'),
        power:     document.querySelector('#power'),
        cadence:   document.querySelector('#cadence'),
        speed:     document.querySelector('#speed'),
        distance:  document.querySelector('#distance'),
        heartRate: document.querySelector('#heart-rate')
    },
    watch: {
        start:   document.querySelector('#watch-start'),
        pause:   document.querySelector('#watch-pause'),
        resume:  document.querySelector('#watch-resume'),
        lap:     document.querySelector('#watch-lap'),
        stop:    document.querySelector('#watch-stop'),
        save:    document.querySelector('#activity-save'),
        workout: document.querySelector('#start-workout'),
        cont:    document.querySelector('#watch'),
        name:    document.querySelector('#workout-name'),
    },
    controls: {
        resistanceMode:   document.querySelector('#resistance-mode-btn'),
        slopeMode:        document.querySelector('#slope-mode-btn'),
        ergMode:          document.querySelector('#erg-mode-btn'),
        freeMode:         document.querySelector('#free-mode-btn'),

        resistanceControls: document.querySelector('#resistance-mode-controls'),
        slopeControls:      document.querySelector('#slope-mode-controls'),
        ergControls:        document.querySelector('#erg-mode-controls'),

        resistanceValue:   document.querySelector('#resistance-value'),
        resistanceInc:     document.querySelector('#resistance-inc'),
        resistanceDec:     document.querySelector('#resistance-dec'),
        // resistanceSet:     document.querySelector('#resistance-set'),
        slopeValue:        document.querySelector('#slope-value'),
        slopeInc:          document.querySelector('#slope-inc'),
        slopeDec:          document.querySelector('#slope-dec'),
        // slopeSet:          document.querySelector('#slope-set'),


        targetPower:       document.querySelector('#target-power-value'),
        workPower:         document.querySelector('#work-power-value'),
        restPower:         document.querySelector('#rest-power-value'),
        setTargetPower:    document.querySelector('#set-target-power'),
        startWorkInterval: document.querySelector('#start-work-interval'),
        startRestInterval: document.querySelector('#start-rest-interval'),
    },
    settings: {
        ftp:        document.querySelector('#ftp-value'),
        ftpBtn:     document.querySelector('#ftp-btn'),
        weight:     document.querySelector('#weight-value'),
        weightBtn:  document.querySelector('#weight-btn'),
    },
    navigation: {
        menu:         document.querySelector('.menu-cont'),
        tabBtns:      document.querySelectorAll('.menu .tab-btn'),
        pages:        document.querySelectorAll('.page'),
        homeBtn:      document.querySelector('#home-tab-btn'),
        settingsBtn:  document.querySelector('#settings-tab-btn'),
        workoutsBtn:  document.querySelector('#workouts-tab-btn'),
        homePage:     document.querySelector('#home-page'),
        settingsPage: document.querySelector('#settings-page'),
        workoutsPage: document.querySelector('#workouts-page'),
        controls:     document.querySelector('.control-screen'),
    },
    file: {
        fileBtn: document.querySelector('#workout-file'),
    },
    workouts: {
        workouts:     document.querySelector('#workouts'),
        list:         document.querySelector('#workouts .list'),
        items: [],
        select: [],
        descriptions: [],
    },
    activity: {
        saveBtn: document.querySelector('#activity-save'),
    },
    graphWorkout: {
        progress:  document.querySelector('#progress'),
        name:      document.querySelector('#current-workout-name'),
        graph:     document.querySelector('#current-workout-graph'),
        intervals: [],
        steps: [],
    },
    graphHr: {
        cont:  document.querySelector('#graph-hr'),
        graph: document.querySelector('#graph-hr .graph')
    },
    graphPower: {
        cont:  document.querySelector('#graph-power'),
        graph: document.querySelector('#graph-power .graph'),
        ftp:   document.querySelector('#ftp-line-value')
    },
    recon: {
        section: document.querySelector('#recon-cont'),
        cont:    document.querySelector('#recon-graph'),
        graph:   document.querySelector('#recon-graph .graph'),
    }
};

export { dom };
