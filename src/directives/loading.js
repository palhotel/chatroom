chatroom.directive('loading', function(){
    return {
        restrict: 'A',
        link: function(scope, elem){
            scope.$watch(function(){
                return scope.loadingDone;
            }, function(newVal, oldVal){
                if(newVal === true){
                    $('.loading-div').css('display', 'none');
                    $('.main-wrapper').css('visibility', 'visible');
                }
            });
        }
    };
});
