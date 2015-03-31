//angular js
angular.module('chatroom', [])
.controller('chatCtrl', function($scope){
		$scope.title = 'Free to Chat';
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
	});
