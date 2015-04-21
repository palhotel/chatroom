//angular js
angular.module('chatroom', [])
.controller('chatCtrl', function($scope, $http, $q){
		$scope.title = 'Free to Chat';
		$scope.users = [];
		$scope.chats = [
			{author:'Da', message:'hello, you are free to say something.', date:new Date().toLocaleString()}
		];

		$q.when($http.get('/api/users')).then(function(res){
				console.log('Got it', res);
				$scope.users = res.data;
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
