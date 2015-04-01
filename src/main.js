//angular js
angular.module('chatroom', [])
.controller('chatCtrl', function($scope){
		$scope.title = 'Free to Chat';
		$scope.me = {
			name: 'Me'
		};
		$scope.users = [
			{
				name: 'zhang',
				online: 'online'
			},
			{
				name: 'li',
				online: 'offline'
			},
			{
				name: 'Me',
				online: 'online'
			}
		];
		$scope.chats = [
			{
				author: 'zhang',
				message: 'hello,world',
				date: new Date().toLocaleString()
			},
			{
				author: 'li',
				message: 'I am here',
				date: new Date().toLocaleString()
			}
		];
		$scope.send = function() {
			$scope.chats.push({
				author: $scope.me.name,
				message: $scope.inputMessage,
				date: new Date().toLocaleString()
			});
		};

	});
