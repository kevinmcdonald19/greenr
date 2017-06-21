//const Nomad = require('nomad-stream')
const nomad = new Nomad()
const port = 5000;
//var bodyParser = require('body-parser');
var SunCalc = require('suncalc');

//// configure app to use bodyParser()
//
//// nomad server
//nomad.subscribe(['QmVohe9oXXAaVBpc5fs42pJs5aoWCk1EY9xEmvkQQDDwk5'], function (message) {
//    console.log('reading: ' + message.power);
//})
//
//// solar panel: this will be the simulation of sending data to our 
//nomad.prepareToPublish().then(function (n) {
//    //    console.log(n);
//    const nomadInstance = n
//    nomadInstance.publishRoot("hi there");
//
//    var endTime;
//    var interval = 1000;
//
//})


// market server
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();
const url = 'mongodb://kevinmcdonald19:Nalah1989!@ds011449.mlab.com:11449/trusted-solar-recs';

MongoClient.connect("mongodb://kevin:kevin@ds011449.mlab.com:11449/trusted-solar-recs", (err, database) => {
    if (err) return console.log(err)

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.listen(port, () => {
        console.log('We are live on ' + port);
    });

    app.get('/readings', (req, res) => {

        database.collection('readings').find().sort({
            timestamp: -1
        }).toArray(function (err, results) {
            if (err) {
                res.send('error');
            } else {
                res.send(results);
            }

        });
    });

    app.post('/readings', (req, res) => {
        console.log('posting here: ' + JSON.stringify(req.body));

        res.send('posing reading');
        var reading = req.body;

        // start doing some logic w/ reading

        //storeIntoSystem(req.body);


    });

    storeIntoSystem();

    function storeIntoSystem() {
        var readings = {};
        var recList = [];
        var fraudList = [];
        var interval = 3000;

        var neighborhoodPowerAverage = Math.random() * (3.5 - 3.0) + 3.0;
        var weatherPowerAverage = Math.random() * (3.5 - 3.0) + 3.0;

        setInterval(function () {
            // TODO: remove when real data comes in
            var reading = {
                panelID: 12345,
                elevationAngle: 3,
                location: {
                    longitude: -71.102185,
                    latitude: 42.367079,
                },
                power: 2.56,
                weather: {
                    cloudCoverage: null,
                    temperature: null
                },
                interval: {
                    stop: function () {
                        new Date();
                    },
                    interval: interval
                },
                certified: null
            }

            reading.power = Math.random() * (4.5 - 2.5) + 2.5;

            // get today's sunlight times for a location
            //        var times = SunCalc.getTimes(new Date(), reading.location.latitude, reading.location.longitude);
            //
            //        console.log('times: ' + times);
            //
            //        // get position of the sun (azimuth and altitude) at today's sunrise
            //        var sunrisePos = SunCalc.getPosition(times.sunrise, reading.location.latitude, reading.location.longitude);
            //        console.log('altitude: ' + sunrisePos.altitude);
            //
            //        // get sunrise azimuth in degrees
            //        var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;
            //
            //        console.log('sunrise Azimuth: ' + sunriseAzimuth);
            //
            //        console.log(JSON.stringify(reading));

            // comparison formula
            var estimate = null;
            //        estimate = (990 * Math.sin(reading.elevationAngle) - 30) * (1 - 0.75 * (Math.pow(reading.weather.cloudCoverage, 3.4)));


            if ((reading.power > (neighborhoodPowerAverage - 1)) && (reading.power < (neighborhoodPowerAverage + 1))) {
                if (reading.power > (weatherPowerAverage - 1) && reading.power < (weatherPowerAverage + 1)) {
                    match = true;
                } else {
                    match = false;
                }
            } else {
                match = false;
            }

            // classify 
            if (match === true) {
                reading.certified = true;
            } else {
                reading.certified = false;
            }

            reading.timestamp = new Date();
            reading.neighborhoodPowerAverage = neighborhoodPowerAverage;
            reading.weatherPowerAverage = weatherPowerAverage;
            reading.estimatedValue = Math.round(0.03 * reading.power * 100) / 100;


            database.collection('readings').insert(reading, (err, results) => {
                //            if (err) {
                //                //                console.log('error saving reading');
                //            } else {
                //                //                console.log('success saving reading');
                //            }
            })
        }, interval);
    }
})