chatroom.directive('moveBoard', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr){
            scope.$watch('wantDraw', function(newVal){
                if(newVal === true){
                    elem.text('<<');
                    $('.main').addClass('move-to-right');
                } else if(newVal === false){
                    elem.text('>>');
                    $('.main').removeClass('move-to-right');
                }
            });
        }
    };
});
