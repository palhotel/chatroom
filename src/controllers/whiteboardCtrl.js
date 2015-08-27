chatroom.controller('whiteboardCtrl', [
    '$scope',
    '$q',
    'socketService',
    'rest',
    function($scope, $q, socketService, rest){
        $scope.brush = {
            strokeStyle: '#FF0000',
            lineWidth: 6
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
