# Flux

Flux is an App for executing structured workouts on a smart trainer.

- executing Zwift .zwo workouts
- works with bluetooth smart trainers and heart rate monitors.
- ERG mode and extended manual control of your trainer with Grade Simulation and Resistance mode.
- recording .fit Activities compatible with all major platforms like Strava, Training Peaks, etc
- build-in collection of structured workouts to get you started
- keyboard controls

The web version is free to use and open source. It is developed as a static PWA, has zero dependancies and is completly independant to run.
Everything happens in your Browser and stays in there. It uses Web Bluetooth, IndexDB, Local Storage, WakeLock API, Vibration API.

_Status_: working on implementing ANT+ over Web Serial API for the browser.

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

A fully featured web version will be released soon, and followed with desktop apps later.

The Web version is running directly in the browser and relies on some of the latest web platform technologies.
Browser support for the web version is the following:

| Chrome | Edge | Opera | Chrome Android | Samsung Internet | Opera Android | Safari | Safari iOS |
|--------|------|-------|----------------|------------------|---------------|--------|------------|
| yes    | yes  | yes   | yes            | yes              | no            | no     | no         |


### Linux
On Chrome, Edge and Opera for Linux you might need to turn on the experimental platforms feature flag at

- Chrome: `chrome://flags/#enable-experimental-web-platform-features`

- Edge: `edge://flags/#enable-experimental-web-platform-features`

- Opera: `opera://flags/#enable-experimental-web-platform-features`

NOTE: Opera support on Linux is a bit shaky at moment. Expect updates.

### iOS
For iOS you can try [WebBLE](https://apps.apple.com/us/app/webble/id1193531073) which is:

> Very simple web browser that supports an initial subset of the web bluetooth.

It is not tested or supported by this project, but you can give it try if your only option is iOS.



## Supported Hardware

### FTMS, or FE-C over BLE

Works with all trainers that implement the bluetooth Fitness Machine Service (FTMS) or the Tacx FE-C over BLE solution.

List of known trainers (not exhaustive) that implement FTMS:

- Tacx Flux 1 / S / 2
- Tacx Flow Smart 

- Elite Direto 
- Elite Suito
- Elite Tuo
- Elite Zumo 

- Saris H3
- Saris M2

- Wahoo Kickr Core
- Wahoo Kickr (using custom solution, but support for FTMS is expected to land with firmware update 1st week of Feb 2021)
<!-- - Wahoo Snap  -->

- Tacx Neo / 2 / 2T (using custom solution ANT+ over Bluetooth, and is currently supported)

### ANT+ FE-C

Currently researching options for FE-C on the web.
When used with an ANT+ usb stick (desktop) the app has now basic support for ANT+ heart rate.

The current development setup is using Suunto movestick mini and Garmin Fenix 5 watch broadcasting heart rate.



## The Demo
You can check a pre-release demo of the web version at [Demo](https://dvmarinoff.github.io/Flux/)

Keep in mind it is in active development and will change and break on daily bases, that's until the first stable version is released.




