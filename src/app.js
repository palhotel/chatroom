require('./less/index.less');
var chatCtrl = require('./controllers/chatCtrl.js');
var whiteboardCtrl = require('./controllers/whiteboardCtrl.js');
var colorHelper = require('./services/colorHelper.js');
var colorService = require('./services/colorService.js');
var rest = require('./services/rest.js');
var Slider = require('./services/Slider.js');
var socketService = require('./services/socketService.js');
var colorpicker = require('./directives/colorpicker.js');
var draw = require('./directives/draw.js');
var loading = require('./directives/loading.js');
var scroll = require('./directives/scroll.js');

var chatroom = angular.module('chatroom', ['ngCookies', 'ng', 'ngSanitize']);

//configs
chatroom.config(['$httpProvider', function($httpProvider){

    $httpProvider.interceptors.push(['$rootScope', '$q', '$cookieStore', function ($rootScope, $q, $cookieStore) {
        return {
            request: function (config) {

                config.headers = config.headers || {};
                if ($cookieStore.get('token')) {
                    config.headers.Authorization = 'Basic ' + $cookieStore.get('token');
                }

                return config;
            }
        };
    }]);
}]);
//controllers
chatroom.controller('chatCtrl', chatCtrl);
chatroom.controller('whiteboardCtrl', whiteboardCtrl);
//services
chatroom.factory('colorHelper', colorHelper);
chatroom.factory('colorService', colorService);
chatroom.factory('rest', rest);
chatroom.factory('Slider', Slider);
chatroom.factory('socketService', socketService);
//directive
chatroom.directive('colorpicker', colorpicker);
chatroom.directive('draw', draw);
chatroom.directive('loading', loading);
chatroom.directive('scroll', scroll);

module.exports = chatroom;