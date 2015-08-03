describe('whiteboardCtrl test', function(){
    var scope;

    beforeEach(angular.mock.module('chatroom'));
    beforeEach(angular.mock.inject(function($rootScope, $controller){
        scope = $rootScope.$new();
        $controller('whiteboardCtrl', {$scope: scope});
    }));

    it('should have a default brush strokeStyle value', function(){
        expect(scope.brush.strokeStyle).toBeDefined();
    });

    it('should have a default brush lineWidth value', function(){
        expect(scope.brush.lineWidth).toBeDefined();
    });

});
