chatroom.controller('whiteboardCtrl', [
    '$scope',
    '$q',
    'socketService',
    'rest',
    function($scope, $q, socketService, rest){
        $scope.colors = [
            {name: 'red', style: 'red-box'},
            {name : '#00FF00', style: 'green-box'},
            {name : '#20A0E9', style: 'blue-box'},
            {name : 'white', style: 'white-box'}
        ];
        $scope.sizes = ['1.0', '3.0', '5.0', '10.0', '20.0'];
        $scope.brush = {
            strokeStyle: 'red',
            lineWidth: '6.0'
        };
        $scope.pic = null;

        var updatePic = function(){
            rest.getPicture()
                .then(function(res){
                    $scope.pic = res.data;
                });
        };

        $scope.$watch(function(){
            return $scope.wantDraw;
        }, function(newVal, oldVal){
            if(newVal === true){
                updatePic();
            }
        });

        socketService.io.on('server:someone-paint', function(){
            updatePic();
        });

        $scope.setBrushColor = function(color){
            $scope.brush.strokeStyle = color;
        };
        $scope.setBrushSize = function(size){
            $scope.brush.lineWidth = size;
        };

    }]);
