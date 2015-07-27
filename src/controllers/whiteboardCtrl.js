chatroom.controller('whiteboardCtrl', [
    '$scope',
    function($scope){
        $scope.colors = [
            {name: 'red', style: 'red-box'},
            {name : '#00FF00', style: 'green-box'},
            {name : '#20A0E9', style: 'blue-box'},
            {name : 'white', style: 'white-box'}
        ];

        $scope.brush = {
            strokeStyle: 'red',
            lineWidth: '6.0'
        };

        $scope.pic = {};

        $scope.setBrushColor = function(color){
            $scope.brush.strokeStyle = color;
        };

    }]);
