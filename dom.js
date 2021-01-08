import { q } from './q.js';

let dom = {
    graphWorkout: {
        // progress:  q.get('#progress'),
        name:      q.get('#current-workout-name'),
        graph:     q.get('#current-workout-graph'),
        intervals: [],
        steps: [],
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
    // recon: {
    //     section: q.get('#recon-cont'),
    //     cont:    q.get('#recon-graph'),
    //     graph:   q.get('#recon-graph .graph'),
    // }
};

export { dom };
