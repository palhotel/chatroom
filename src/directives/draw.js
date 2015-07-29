chatroom.directive('draw', [
    'socketService',
    '$http',
    function(socketService){
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
            var mouseX, mouseY, newX, newY;
            var isMouseDown = false;

            scope.$watch('pic', function(newVal, oldVal){
                if(scope.pic){
                    var imageObj = new Image();
                    imageObj.src = scope.pic;
                    if(isMouseDown === false){
                        imageObj.onload = function() {
                            ctx.drawImage(this, 0, 0);
                        };
                    } else{
                        imageObj.onload = function() {
                            ctx.drawImage(this, 0, 0);
                            if(mouseX != newX || mouseY != newY){
                                redraw();
                            }
                        };
                    }

                }
            });

            scope.$watch('brush', function(newVal){
                if(newVal && newVal.hasOwnProperty('strokeStyle') && newVal.hasOwnProperty('lineWidth')){
                    ctx.strokeStyle = newVal.strokeStyle;
                    ctx.lineWidth = newVal.lineWidth;
                }
            }, true);

            var redraw = function(){
                ctx.beginPath();
                ctx.moveTo(mouseX, mouseY);
                ctx.lineTo(newX, newY);
                ctx.stroke();

            };

            elem.mousedown(function(e) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
                isMouseDown = true;
                elem.css({cursor: 'crosshair'});
            });

            elem.mousemove(function(e){
                if(isMouseDown) {
                    newX = e.offsetX;
                    newY = e.offsetY;
                    redraw();
                    mouseX = newX;
                    mouseY = newY;
                }
            });

            var savePaint = function(){
                isMouseDown = false;
                socketService.io.emit('user:save-paint', elem.get(0).toDataURL());
                elem.css({cursor: 'default'});
            };

            elem.mouseup(function(e){
                savePaint();
            });

            elem.mouseleave(function(e){
                savePaint();
            });
        }
    };
}]);
