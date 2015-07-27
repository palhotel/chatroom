chatroom.directive('draw', function(){
    var defaults = {
        lineCap : 'round',
        lineJoin : 'round'
    };
    return {
        restrict: 'A',
        scope:{
            brush : '=',
            pic : '='
        },
        link: function(scope, elem, attr){
            var ctx=elem.get(0).getContext('2d');
            ctx = $.extend(ctx, defaults, scope.brush);
            var mouseX, mouseY;
            var isMouseDown = false;

            scope.$watch('brush.strokeStyle', function(newVal){
                ctx.strokeStyle = newVal;
            });

            elem.mousedown(function(e) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
                isMouseDown = true;
                elem.css({cursor: 'crosshair'});
            });

            elem.mousemove(function(e){
                if(isMouseDown) {
                    var x1 = mouseX;
                    var y1 = mouseY;
                    var x2 = e.offsetX;
                    var y2 = e.offsetY;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();

                    mouseX = x2;
                    mouseY = y2;
                }
            });

            elem.mouseup(function(e){
                isMouseDown = false;
                scope.pic = elem.get(0).toDataURL();
                elem.css({cursor: 'default'});
            });

            elem.mouseleave(function(e){
                isMouseDown = false;
                scope.pic = elem.get(0).toDataURL();
                elem.css({cursor: 'default'});
            });
        }
    };
});
