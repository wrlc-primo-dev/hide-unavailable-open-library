(function () {
    "use strict";
    'use strict';


    var app = angular.module('viewCustom', ['angularLoad', 'wrlcAnnounce']);

    /****************************************************************************************************/

        /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

        /*var app = angular.module('centralCustom', ['angularLoad']);*/

    /****************************************************************************************************/

    /* Create reusable function for checking ISBNs */
    app.factory('isbnCheck', ['$http', function($http) {
        let self = this;

        // Get ISBN from Open Library service link
        self.setIsbn = function(url) {

            // Get the OpenLibrary link's URL and unescape all entities
            let value = unescape(url);

            // Strip everything but ISBN from OpenLibrary URL
            let isbn1 = value.replace('https://openlibrary.org/search?isbn=', '');

            // Split ISBN into array with everything before first special character in first element
            let isbn2 = isbn1.split(/[^\w\s]/gi, 1);

            // Strip any leftover white space from array's first element leaving a clean ISBN value
            return isbn2[0].replace(/\s{2,}/g, " ");
        }

        // Check availability in Open Library
        self.openLibrary = function(getIt, isbn, selector, ctrl) {
            let url = 'https://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&format=json';

            // Request the Search API URL
            $http.get(url).then(function successCallback(response) {
                if (response.data) {

                    // If request gets a response with data, create a formatted ISBN var to search for
                    let isbnKey = 'ISBN:' + isbn;
                    if (isbnKey in response.data) {
                        let isbnValue = response.data[isbnKey];

                        // If the ISBN is in the response look for a 'preview' element
                        if ((!(isbnValue['preview'])) || (isbnValue['preview'] !== 'borrow')) {

                            // If there is no 'preview' element, then add a class to hide the OpenLibrary link
                            if (getIt === 'how') {
                                document.querySelector(selector).closest('md-list-item').classList.add('ng-hide')
                            } else {
                                document.querySelector(selector).classList.add('ng-hide')
                            }
                        }
                    } else {
                        // If the ISBN is not in the response, then add a class to hide the OpenLibrary link
                        if (getIt === 'how') {
                            document.querySelector(selector).closest('md-list-item').classList.add('ng-hide')
                        } else {
                            document.querySelector(selector).classList.add('ng-hide')
                        }
                    }
                }
            }, function errorCallback(response) {
                // If request gets a response without data, log response to console but don't hide link
                console.log(response);
            })
        }
        return self;
    }]);

    /* Hide OpenLibrary link as "Availability > REQUEST" (Get It) if no ISBN match */
    app.controller('HideOpenLibraryRequestController', ['isbnCheck', '$scope', function(isbnCheck, $scope) {
        let ctrl = this;
        let getIt = '';
        // Watch for locationServices to populate
        $scope.$watch('$ctrl.parentCtrl.locationServices', function(service) {
            // Only act if service is defined
            if (service) {
                let services = service['serviceinfo'];

                // Only act on the service if it's an OvL linking to OpenLibrary
                let i = 1;
                for (i = 0; i < services.length; i++) {
                    if ((services[i]['service-type'] === 'OvL') && (services[i]['link-to-service'].startsWith('https://openlibrary.org/search?isbn='))) {

                        // Get service label and strip any trailing white space
                        let label = services[i]['type'].trim();
                        let selector = 'button[aria-label="' + label + '"]';

                        // Get ISBN from Open Library service link
                        let isbn = isbnCheck.setIsbn(services[i]['link-to-service']);

                        // Check Open Library for borrowable copy of book and hide/show based on results
                        isbnCheck.openLibrary(getIt, isbn, selector, ctrl);

                    }
                }
            }
        });
    }]);

    app.component('prmRequestServicesAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'HideOpenLibraryRequestController',
        template: ''
    })

    /* Hide OpenLibrary link as "How to Get It" w/no sub-heading (How to Get It) if no ISBN match */
    app.controller('HideOpenLibraryGetItController', ['isbnCheck', '$scope', function(isbnCheck, $scope) {
        let ctrl = this;
        let getIt = 'how';
        // Get serviceinfo elements for HowToGetitService in an array
        $scope.$watch('$ctrl.parentCtrl.almaHowToGetitService._services.serviceinfo', function(service) {
            // Only act if service is defined
            if (service) {
                // Iterate through the serviceinfo array
                var i;
                for (i = 0; i < service.length; i++) {
                    // Only act on serviceinfo elements containing an OpenLibrary link
                    if (service[i]['link-to-service'].startsWith('https://openlibrary.org/search?isbn=')) {
                        let label = service[i]['type'];
                        let selector = 'a[translate="' + label + '"]';

                        // Get ISBN from Open Library service link
                        let isbn = isbnCheck.setIsbn(service[i]['link-to-service']);

                        // Check Open Library for borrowable copy of book and hide/show based on results
                        isbnCheck.openLibrary(getIt, isbn, selector, ctrl);
                    }
                }
            }

        });
    }]);

    app.component('almaHowovpAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'HideOpenLibraryGetItController',
        template: ''
    })

    /* Hide OpenLibrary link as "View Online > Full text availability" (View It) if no ISBN match */
    app.controller('HideOpenLibraryOnlineController', ['isbnCheck', '$scope', function(isbnCheck, $scope) {
        let ctrl = this;
        let getIt = '';
        // Get services as an array
        $scope.$watch('$ctrl.parentCtrl.services', function(service) {
            // Only act if service is defined
            if (service) {
                // Iterate through the services array
                var i;
                for (i = 0; i < service.length; i++) {
                    // Only act on services with an OpenLibrary URL
                    if (service[i]['serviceUrl'].startsWith('https://openlibrary.org/search?isbn=')) {
                        let label = service[i]['packageName'] + '  , opens in a new window';
                        let selector = 'md-list-item[aria-label="' + label + '"]';

                        // Get ISBN from Open Library service link
                        let isbn = isbnCheck.setIsbn(service[i]['serviceUrl']);

                        // Check Open Library for borrowable copy of book and hide/show based on results
                        isbnCheck.openLibrary(getIt, isbn, selector, ctrl);
                    }
                }
            }
        })
    }]);

    app.component('prmAlmaViewitItemsAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'HideOpenLibraryOnlineController',
        template: ''
    })

})();

