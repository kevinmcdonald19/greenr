(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name $mdListInkRipple
     * @module material.core
     *
     * @description
     * Provides ripple effects for md-list.  See $mdInkRipple service for all possible configuration options.
     *
     * @param {object=} scope Scope within the current context
     * @param {object=} element The element the ripple effect should be applied to
     * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
     */

    angular.module('material.core')
        .factory('$mdListInkRipple', MdListInkRipple);
    function MdListInkRipple($mdInkRipple) {
        return {
            attach: attach
        };
        function attach(scope, element, options) {
            return $mdInkRipple.attach(scope, element, angular.extend({
                center: false,
                dimBackground: true,
                outline: false,
                rippleSize: 'full'
            }, options));
        };
    };
})();
