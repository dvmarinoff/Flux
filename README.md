# Flux

Flux is an App for executing structured workouts on a smart trainer.

- executing Zwift .zwo workouts
- works with bluetooth smart trainers, power meters and heart rate monitors.
- ERG mode and extended manual control of your trainer with Grade Simulation and Resistance mode.
- recording .FIT Activities compatible with all major platforms like Strava, Training Peaks, etc
- build-in collection of structured workouts to get you started

The web version is free to use and open source. It is developed as a static PWA, has zero dependancies and is completly independant to run.
Everything happens in your Browser and stays in there. It uses Web Bluetooth, Web Components, IndexDB, Local Storage, WakeLock API, Vibration API.

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

The following table is copied from [DC Rainmaker Trainer Guide](https://www.dcrainmaker.com/2020/11/smart-cycle-trainer-recommendations-guide-winter.html/#technical-considerations) and shows current protocol support across the industry.

```
- Elite:    ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers.
- Gravat:   ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers
- JetBlack: ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers.
- Kinetic:  ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers.
- Minoura:  ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers.
- Saris:    ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers.
- STAC:     ANT+ FE-C and Bluetooth FTMS on all 2020 smart trainers.
- Tacx:     ANT+ FE-C on all ‘Smart’ branded trainers (except Satori). FTMS on all non-NEO models. FEC over BLE on NEO.
- Wahoo:    ANT+ FE-C on all smart trainers. Has private Wahoo Bluetooth Smart control, no proper FTMS support yet.
- 4iiii:    ANT+ FE-C and Bluetooth FTMS on Fliiiight (--Ed)
```

The notable misses here are Wahoo Kickr and Kickr Core.
Wahoo Kickr v5 (the latest version) is expected to land support for FTMS with firmware update in the 1st week of Feb 2021.

[Kickr v5 Updates:](https://support.wahoofitness.com/hc/en-us/articles/360016826680-KICKR-v5-Firmware-Updates)
> KICKR v5 Firmware v4.2.1 - 27 January 2021
> - Added: Direct Connect Support
> - Added: Bluetooth FTMS Support

### ANT+

Support for ANT+ is experimental at the moment. Works only on desktop in combination with ANT+ stick,
and can be very frigile. To connect ANT+ device use the special ANT+ row at the bottom of Settings Page.
Better support and full integration are coming soon.

The current development setup is using Suunto movestick mini, Garmin Fenix 5 watch broadcasting heart rate,
Tacx Heart Rate monitor, and Tacx Flux S trainer.

NOTE: ANT+ code as at the beta-archive branch. It's currently being re-written.

## The Demo
You can check a pre-release demo of the web version at [Demo](https://dvmarinoff.github.io/Flux/)

Keep in mind it is in active development and will change and break on daily bases, that's until the first stable version is released.
