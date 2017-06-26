//const Nomad = require('nomad-stream')
//const nomad = new Nomad()
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
const ss = require('simple-statistics');
const app = express();
const nd = require('normal-distribution');
const mathjs = require('mathjs');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
}));


MongoClient.connect("mongodb://kevin:kevin@ds011449.mlab.com:11449/trusted-solar-recs", (err, database) => {
    if (err) return console.log(err)

    //    app.use(bodyParser.urlencoded({
    //        extended: true
    //    }));

    app.use(express.static('public'));

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.listen(process.env.PORT || port, () => {
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


    app.get('/thermometer', (req, res) => {

        database.collection('thermometerReading').find().sort({
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

        storeIntoSystem(reading);
    });

    app.post('/thermometer', (req, res) => {
        console.log('posting thermometer data here: ' + JSON.stringify(req.body));

        var reading = req.body;
        var newValue;
        database.collection('thermometerReading').find()
        .limit(1).sort({$natural:-1})
        .toArray(function (err, results) {
            if (err) {
                res.status(500).send('error');
            } else {
                newValue = results[0].set;
                newValue[parseInt(reading.index)] = Math.round(parseFloat(reading.value));
                console.log(newValue);
                storeThermometerData(newValue[3], newValue);
                res.send('hi');
            }
        });
        

        

        

    });

    //    storeThermometerData();

    function storeThermometerData(temperatureValue, temperatureValues_array) {
        //        var temperatureValue = {
        //            data: 90
        //        };

        //        var temperatureValues_array = [81, 82, 83, 80, 84, 82, 79, 83];
        //        temperatureValues_array.push(temperatureValue.data);

        //        var otherTemperatureValues = [
        //            {
        //                data: 80
        //            },
        //            {
        //                data: 80
        //            },
        //            {
        //                data: 82
        //            }
        //        ];

        // calculate average
        //        var sum = 0;
        //        for (var i = 0; i < otherTemperatureValues.length; i++) {
        //            console.log(otherTemperatureValues[i].data);
        //            sum += otherTemperatureValues[i].data;
        //        }
        //        var average = sum / otherTemperatureValues.length;
        //        console.log('average: ' + average);
        //
        //        // calculate variance
        //        var varianceSum = 0;
        //        for (var j = 0; j < otherTemperatureValues.length; j++) {
        //            console.log('variance sum: ' + varianceSum);
        //            varianceSum += Math.pow(otherTemperatureValues[j].data - average, 2);
        //        }
        //
        //        var variance = 0.0;
        //        variance = varianceSum / otherTemperatureValues.length;
        //        console.log('variance: ' + variance);
        //
        //        // calculate standard deviation
        //        var standardDeviation = Math.pow(variance, 0.5);
        //        console.log('standard deviation: ' + standardDeviation);

        // pseudo algorithm for reading and standard deviation

        for (var i = 0; i < temperatureValues_array.length; i++) {
            console.log(temperatureValues_array[i]);
        }
        var mean = ss.mean(temperatureValues_array);
        console.log('mean: ' + mean);
        var standardDeviation = ss.standardDeviation(temperatureValues_array);
        console.log('standard deviation: ' + standardDeviation);
        var zScore = ss.zScore(temperatureValue, mean, standardDeviation);
        var zeroZScore = ss.zScore(mean, mean, standardDeviation); // should always be 0
        console.log('z-score of ' + temperatureValue + ': ' + zScore);
        //        var normalDistribution = ss.standardNormalTable(zScore);

        var areaPercentage = cdfNormal(temperatureValue, mean, standardDeviation) * 100;
        console.log('area %: ' + areaPercentage);

        var trustScore = -1;
        absoluteZScore = Math.abs(zScore);
        console.log('abs z: ' + absoluteZScore);
        if (absoluteZScore <= 1) {
            trustScore = 3;
        } else if (absoluteZScore <= 2 && absoluteZScore > 1) {
            trustScore = 2;
        } else if (absoluteZScore < 3 && absoluteZScore > 2) {
            trustScore = 1;
        } else {
            trustScore = 0;
        }

        console.log('trustScore: ' + trustScore);

        var payout = trustScore * 0.03;

        var thermometerReading = {
            x: temperatureValue,
            set: temperatureValues_array,
            mean: mean,
            zScore: zScore,
            standardDeviation: standardDeviation,
            areaPercentage: areaPercentage,
            iotID: 1,
            trustScore: trustScore,
            payout: payout
        };

        thermometerReading.timestamp = new Date();

        database.collection('thermometerReading').insert(thermometerReading, (err, results) => {
            console.log('saved thermometerReading');
        })

    }

    function cdfNormal(x, mean, standardDeviation) {
        return (1 - mathjs.erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2
    }

    function storeIntoSystem(actualReading) {
        var readings = {};
        var recList = [];
        var fraudList = [];
        var interval = 3000;

        var min = 2900;
        //        var min = 2600;
        var max = 3000;
        //        var max = 2700;
        var neighborhoodPowerAverage = 3200;
        var weatherPowerAverage = neighborhoodPowerAverage;
        //        var neighborhoodPowerAverage = 2680;
        //        var weatherPowerAverage = 2680;


        // TODO: remove when real data comes in
        var reading = {
            panelID: 12345,
            elevationAngle: 3,
            location: {
                longitude: -71.102185,
                latitude: 42.367079,
            },
            power: null,
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

        reading.power = actualReading.data;

        //        var randMin = 4500;
        //        var randMax = 2500;
        //        reading.power = Math.random() * (randMax - randMin) + randMin;

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

        var range = 50;
        if ((reading.power > (neighborhoodPowerAverage - range)) && (reading.power < (neighborhoodPowerAverage + range))) {
            if (reading.power > (weatherPowerAverage - range) && reading.power < (weatherPowerAverage + range)) {
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
            console.log('saving reading');
        })

    }
})