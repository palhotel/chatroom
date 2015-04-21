//angular js
angular.module('chatroom', [])
.controller('chatCtrl', function($scope, $http, $q){
		$scope.title = 'Free to Chat';
		$scope.users = [];
		$scope.chats = [];

		$q.when($http.get('/api/users')).then(function(res){
				console.log('Got it', res);
				$scope.users.push(res.data);
		});
		
		$scope.me = {
			name: 'Me'
		};
		
		$scope.send = function() {
			$scope.chats.push({
				author: $scope.me.name,
				message: $scope.inputMessage,
				date: new Date().toLocaleString()
			});
		};

	});
