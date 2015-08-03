describe('chatCtrl test', function(){
    var scope;

    beforeEach(angular.mock.module('chatroom'));
    beforeEach(angular.mock.inject(function($rootScope, $controller){
        scope = $rootScope.$new();
        $controller('chatCtrl', {$scope: scope});
    }));

    it('should have a title Free to Chat', function(){
        expect(scope.title).toBe('Free to Chat');
    });

});
