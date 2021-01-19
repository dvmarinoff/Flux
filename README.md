# Flux

Flux is an App for executing structured workouts on a smart trainer.

- executing Zwift .zwo workouts
- works with bluetooth smart trainers and heart rate monitors.
- ERG mode and extended manual control of your trainer with Grade Simulation and Resistance mode.
- recording .fit Activities compatible with all major platforms like Strava, Training Peaks, etc
- build-in collection of structured workouts to get you started
- keyboard controls

The web version is free to use and open source. It is developed as a serverless PWA, has zero dependancies and is completly independant to run.
Everything happens in your Browser and stays in there. It uses Web Bluetooth, IndexDB, Local Storage, WakeLock API, Vibration API.

## Screenshots

<table>
  <tr>
     <td>
       <img alt="Home Page" width="320px" src="doc/images/home-page.jpg" />
     </td>
     <td>
       <img alt="Workouts Page" width="320px" src="doc/images/workouts-page.jpg" />
     </td>
     <td>
       <img alt="Settings-page" width="320px" src="doc/images/settings-page.jpg" />
     </td>
  </tr>
</table>

## Supported Platforms

A fully featured web version will be released by the end Jan 2021, and followed with desktop apps later.

The Web version is running directly in the browser and relies on some of the latest web platform technologies.
Browser support for the web version is the following:

| Chrome | Chrome Android | Edge | Opera | Opera Android | Samsung Internet | Safari | Safari iOS |
|--------|----------------|------|-------|---------------|------------------|--------|------------|
| yes    | yes            | yes  | yes   | no            | yes              | no     | no         |

On Chrome for Linux you might need to turn on the experimental platforms feature flag at `chrome://flags/#enable-experimental-web-platform-features`


## Supported Hardware

Works with all trainers that implement the Fitness Machine (FTMS) bluetooth Profile or simply put Bluetooth Smart.


## The Demo
You can check a pre-release demo of the web version at [Demo](https://dvmarinoff.github.io/Flux/)

Keep in mind it is in active development and will change and brake on daily bases, that's until the first stable version is released.



