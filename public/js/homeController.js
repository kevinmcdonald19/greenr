mainModule.controller('HomeController', function ($rootScope, $scope, $http, userService) {
    var self = this;
    //    $scope.showPublishers = false;
    //    $scope.togglePublishers = function () {
    //        $scope.showPublishers = !$scope.showPublishers;
    //    };
    //
    //    // test authentication





    setInterval(function () {

        $http.get('/readings').then(function (response) {
            if (response) {
                console.log('we got readings');
                $scope.readings = response.data;

                // count of certified
                var numCertified = 0;
                var numFraud = 0;
                angular.forEach($scope.readings, function (reading) {
                    if (reading.certified == true) {
                        numCertified++;
                    } else {
                        numFraud++;
                    }
                });

                $scope.numCertified = numCertified;
                $scope.numFraud = numFraud;
            }
        }, function (response) {
            console.log('error');

        });
    }, 100);

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