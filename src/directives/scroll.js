chatroom.directive('scroll', function(){
    return {
        restrict: 'A',
        scope:{
            messages : '='
        },
        link: function(scope, elem){
            scope.$watch(function(){
                return scope.messages.length;

            }, function(newValue, oldValue){
                setTimeout(function(){
                    var scrollHeight = elem.prop('scrollHeight');
                    elem.prop('scrollTop', scrollHeight);
                }, 0);
            });
        }
    };
});
