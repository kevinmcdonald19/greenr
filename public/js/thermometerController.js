mainModule.controller('ThermometerController', function ($rootScope, $scope, $http, userService) {

    $scope.input1 = {
        num: 75
    };

    $scope.input2 = {
        num: 80
    };

    $scope.input3 = {
        num: 81
    };

    $scope.input4 = {
        num: 98
    };

    $scope.getNumber = function () {
        alert('The number is: [' + $scope.input.num + ']');
    };

    $scope.onChange = function () {
        console.log('The number is Changed ', $scope.input.num);
    };

    $scope.getReadings = function () {
        return $http.get('/thermometer');
    };

    var getDone = 1;

    $scope.currentReading = null;
    $scope.currentDataArray = [$scope.input1.num, $scope.input2.num, $scope.input3.num, $scope.input4.num];

    // initial load of readings
    $scope.getReadings();

    setInterval(function () {
        $scope.sendData().then(function (response) {
            console.log('post successful');

            // update the live feed
            $scope.getReadings().then(function (response) {
                console.log('get');
                $scope.currentReading = response.data[0];
                $scope.currentReading.zScore = $scope.currentReading.zScore.toFixed(2);
                $scope.currentReading.standardDeviation = $scope.currentReading.standardDeviation.toFixed(2);
                $scope.thermometerReadings = response.data;

                // draw histogram
                var data = [
                    {
                        x: $scope.currentDataArray,
                        type: 'histogram',
                        marker: {
                            color: '#AECA89'
                        },
                        xbins: {
                            size: $scope.currentReading.standardDeviation / 4,
                            start: $scope.currentReading.mean - (4 * $scope.currentReading.standardDeviation),
                            end: $scope.currentReading.mean + (4 * $scope.currentReading.standardDeviation)
                        }
                    }
                ];

                Plotly.newPlot('myDiv', data);
            });
        }, function (response) {
            console.log('error posting: ' + JSON.stringify(response));
        });
    }, 5000);

    $scope.sendData = function () {
        var data = {
            num1: $scope.input1.num,
            num2: $scope.input2.num,
            num3: $scope.input3.num,
            num4: $scope.input4.num
        };

        return $http({
            method: 'POST',
            url: '/thermometer',
            json: true,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };

    //
    //    $scope.partner = {};
    //    $scope.partner.username;
    //
    //    function initHomeController() {
    //        $scope.userFound = true;
    //
    //        $scope.updatePartnerUsername = function () {
    //            console.log('update partner username');
    //
    //            var partnerUsername = $scope.partner.username;
    //            userService.updatePartnerUsername($scope.user.username, partnerUsername).then(function (response) {
    //                if (response.data != '' && response.data != null) {
    //                    $scope.user = response.data;
    //                    $scope.userFound = true;
    //                } else {
    //                    $scope.userFound = false;
    //                }
    //            });
    //        }
    //
    //        $scope.logout = function () {
    //            $http.post('/logout', {}).finally(function () {
    //                $rootScope.authenticated = false;
    //                $location.path("/");
    //            });
    //        };
    //    }


});