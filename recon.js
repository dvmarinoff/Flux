import { xf } from './xf.js';
import {
    sin,
    cos,
    sqrt,
    sum,
    first,
    second,
    last,
    nextToLast,
} from './functions.js';

import { zvezdecaStrava } from './courses/demo-courses.js';

let file =
`<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="StravaGPX" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
    <metadata>
    <time>2020-06-20T10:23:10Z</time>
    </metadata>
    <trk>
    <name>Zvezdica Climb</name>
    <type>1</type>
    <trkseg>
   <trkpt lat="42.6491380" lon="23.2568910">
    <ele>733.4</ele>
    <time>2020-06-20T11:15:49Z</time>
    <extensions>
     <gpxtpx:TrackPointExtension>
      <gpxtpx:atemp>30</gpxtpx:atemp>
      <gpxtpx:hr>138</gpxtpx:hr>
     </gpxtpx:TrackPointExtension>
    </extensions>
   </trkpt>
   <trkpt lat="42.6491370" lon="23.2568370">
    <ele>733.8</ele>
    <time>2020-06-20T11:15:50Z</time>
    <extensions>
     <gpxtpx:TrackPointExtension>
      <gpxtpx:atemp>30</gpxtpx:atemp>
      <gpxtpx:hr>137</gpxtpx:hr>
     </gpxtpx:TrackPointExtension>
    </extensions>
   </trkpt>
   <trkpt lat="42.6491390" lon="23.2567860">
    <ele>734.2</ele>
    <time>2020-06-20T11:15:51Z</time>
    <extensions>
     <gpxtpx:TrackPointExtension>
      <gpxtpx:atemp>30</gpxtpx:atemp>
      <gpxtpx:hr>137</gpxtpx:hr>
     </gpxtpx:TrackPointExtension>
    </extensions>
   </trkpt>
   <trkpt lat="42.6491410" lon="23.2567330">
    <ele>734.8</ele>
    <time>2020-06-20T11:15:52Z</time>
    <extensions>
     <gpxtpx:TrackPointExtension>
      <gpxtpx:atemp>30</gpxtpx:atemp>
      <gpxtpx:hr>138</gpxtpx:hr>
     </gpxtpx:TrackPointExtension>
    </extensions>
   </trkpt>
</trkseg>
</trk>
</gpx>`;



const EarthsRadius = 6378137;

function degToRad(deg) {
    return deg * Math.PI / 180;
};

function radToDeg(rad) {
    return rad * 180 / Math.PI;
};

class Point {
    constructor(args) {
        this.location  = args.location  || { lat: 0, lon: 0 };
        this.elevation = args.elevation || 0;
        this.heading   = args.heading   || 0;
        this.distance  = args.distance  || 0;
        this.grade     = args.grade     || 0;
        this.gain      = args.gain      || 0;
    }
    locationInRad() {
        return {
            lat: degToRad(this.location.lat),
            lon: degToRad(this.location.lon)
        };
    }
    location() { return this.location; }
    lat() { return this.location.lat; }
    lon() { return this.location.lon; }
    elevation() { return this.elevation; }
    heading() { return this.heading; }
    distance() { return this.distance; }
    gain() { return this.gain; }
    grade() { return this.grade; }

    setLocation(lat, lon) {
        this.location.lat = lat;
        this.location.lon = lon;
    }
    setLat(lat) {
        if(isNaN(lat)) throw new Error('Setting latitide that is NaN');
        this.location.lat = lat;
    }
    setLon(lon) {
        if(isNaN(lon)) throw new Error('Setting longitude that is NaN');
        this.location.lon = lon;
    }
    setElevation(elevation) {
        if(isNaN(elevation)) throw new Error('Setting elevation that is NaN');
        this.elevation = elevation;
    }
    setGain(gain) {
        if(isNaN(gain)) throw new Error('Setting gain that is NaN');
        this.gain = gain;
    }
    setGrade(grade) {
        if(isNaN(grade)) throw new Error('Setting grade that is NaN');
        this.grade = grade;
    }
    setDistance(distance) {
        if(isNaN(distance)) throw new Error('Setting distance that is NaN');
        this.distance = distance;
    }
    setHeading(heading) {
        if(isNaN(heading)) throw new Error('Setting heading that is NaN');
        this.heading = heading;
    }
}

//       haversine :: location in rad -> deg
function haversine (p1, p2) {
    const dLat = (p2.lat - p1.lat);
    const dLon = (p2.lon - p1.lon);
    const a    = sin(dLat / 2) * sin(dLat / 2) +
                 cos(p1.lat)   * cos(p2.lat) *
                 sin(dLon / 2) * sin(dLon / 2);

    const c    = 2 * Math.atan2(sqrt(a), sqrt(1 - a));
    const d    = EarthsRadius * c;

    return d;
};

//       computeDistanceBetween :: location in rad -> deg
function computeDistanceBetween(p1, p2) {
    let distance = haversine(p1, p2);
    return distance;
}

//       computeHeading :: location in rad -> deg
function computeHeading(p1, p2) {
    const dLat    = (p2.lat - p1.lat);
    const dLon    = (p2.lon - p1.lon);
    const y       = sin(dLon) * cos(p2.lat);
    const x       = cos(p1.lat) * sin(p2.lat) -
                    sin(p1.lat) * cos(p2.lat) * cos(dLon);
    const theta   = Math.atan2(y, x);
    const heading = (theta * 180 / Math.PI + 360) % 360;

    return heading;
}

//       computeElevationGain :: meters -> meters
function computeElevationGain(ele1, ele2) {
    return (((ele2 * 10) - (ele1 * 10)) / 10);
}

//       computeGrade :: point point -> %
function computeGrade(p1, p2, gain, distance) {
    let opposite = gain;
    let adjacent = distance;
    return 100 * (opposite / adjacent);
}

function gpxToPoints(trkpts) {
    let points = [];
    for(let i = 0; i < trkpts.length; i++) {
        let p   = trkpts[i];
        let lat = parseFloat(p.getAttribute('lat'));
        let lon = parseFloat(p.getAttribute('lon'));
        let ele = (parseFloat(p.querySelector('ele').textContent));

        let location = {lat: lat, lon: lon};
        let point    = new Point({location: location, elevation: ele});

        if(i > 0) {
            let pointPrev = points[i - 1];

            let heading  = computeHeading(pointPrev.locationInRad(), point.locationInRad());
            let distance = computeDistanceBetween(pointPrev.locationInRad(), point.locationInRad());
            let gain     = computeElevationGain(pointPrev.elevation, point.elevation);
            let grade    = computeGrade(pointPrev, point, gain, distance);

            point.setHeading(heading);
            point.setDistance(distance);
            point.setGain(gain);
            point.setGrade(isNaN(grade) ? 0 : grade); // fix that
        };
        points.push(point);
    }

    first(points).setHeading(second(points).heading);

    return points;
}

function fitToPoints() {}



function Recon() {
    let parser = new DOMParser();
    // let dom    = parser.parseFromString(file, "text/xml");
    let dom    = parser.parseFromString(zvezdecaStrava, "text/xml");
    let trkpts = dom.querySelectorAll('trkpt');

    // console.log(dom);
    console.log(trkpts.length);

    let points = gpxToPoints(trkpts);

    xf.dispatch('recon:points', points);
    // console.log(points);
}


export { Recon };

// let loc1 = {lat: 42.6491380, lon: 23.2568910};
// let loc2 = {lat: 42.6491370, lon: 23.2568370};
