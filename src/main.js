angular.module('chatroom', ['ngCookies'])
.controller('chatCtrl', [
		'$scope',
		'$http',
		'$q',
		'$cookieStore',
		function($scope, $http, $q, $cookieStore){

		$scope.title = 'Free to Chat';
		$scope.users = [];
		$scope.chats = [];

		var hotkeys = {
			ctrl : false,
			enter : false
		};

		var resetStatus = function(){
			$scope.statusMessage = 'Free to login, If your name is occupied, please input the password, ' +
				'otherwise input a new name and remember your password.';
			$scope.me = {
				name: 'Me'
			};
			$scope.alreadyLogin = false;
		};

		var getOnlineUsers = function(users){
			var newArray = [];
			users.map(function(item){
				if(item.hasOwnProperty('online') && item.online === 1) {
					newArray.push(item);
				}
			});
			return newArray;
		};

		var SaveLoginInfo = function(userId, name, pass){
			$scope.alreadyLogin = true;
			$scope.me.name = name;
			$scope.me.userId = userId;
			$scope.me.password = pass;
			$cookieStore.put('user', {
				name: $scope.me.name,
				password: $scope.me.password
			});
		};

		var getSavedInfo = function(){
			var savedInfo = $cookieStore.get('user');
			if(savedInfo && savedInfo.hasOwnProperty('password')) {
				tryLogin(savedInfo.name, savedInfo.password);
			}
		};

		var tryLogin = function(name , pass){
			$q.when($http.post('/api/security/userlogin', {name : name, password: pass}))
				.then(function(res){
					if(res && res.data && res.data.login === true){
						SaveLoginInfo(res.data.userId, name, pass);
						return null;
					} else {
						return $q.when($http.post('/api/users', {name : name, password: pass, online_state: 1, role: 0}));
					}
				})
				.then(function(res){
					if(res && res.data && res.data.userId) {
						SaveLoginInfo(res.data.userId, name, pass);
					}
					$scope.users.push({name : $scope.me.name, online : 1});
					$scope.statusMessage = 'Enjoy it !';
				}, function(err) {
					if(err) {
						$scope.statusMessage = 'Error:  login failed! Can you try another name ?';
					}
				});
		};

		$scope.login = function(){
			tryLogin($scope.inputName, $scope.inputPass);
		};

		$scope.logout = function(){
			$q.when($http.post('/api/security/userlogout', {name : $scope.me.name, password: $scope.me.password}))
				.then(function(){

					for(var i = 0, l = $scope.users.length; i < l; i ++) {
						if($scope.users[i].name && $scope.users[i].name === $scope.me.name) {
							$scope.users.splice(i, 1);
							break;
						}
					}
					resetStatus();
					$cookieStore.remove('user');
				}, function(){
					$scope.statusMessage = 'Error: logout failed';
				});
		};

		$scope.send = function() {
			if($scope.inputMessage !== '') {
				var datetime = new Date().toLocaleString();
				$q.when($http.post('/api/messages', {from_id : $scope.me.userId, message : $scope.inputMessage || ' ', date : datetime}))
					.then(function(res){
						$scope.inputMessage = '';
					});
			}
		};

		$scope.keyDownHandler = function($event){
			if($event.keyCode === 17) {
				hotkeys.ctrl = true;
			} else if($event.keyCode === 13){
				if(hotkeys.ctrl === true) {
					$scope.send();
				}
			}
		};

		$scope.keyUpHandler = function($event){
			if($event.keyCode === 17) {
				hotkeys.ctrl = false;
			} else if($event.keyCode === 13) {
				hotkeys.enter = false;
			}
		};

		resetStatus();
		getSavedInfo();

		$q.when($http.get('/api/users'))
			.then(function(res){
				$scope.users = getOnlineUsers(res.data);
			});

		//polling
		setInterval(function(){
			$q.when($http.get('/api/messages'))
				.then(function(res){
					$scope.chats = res.data;
				});
		}, 500);

	}])
.directive('scroll', function(){
	return {
		restrict: 'A',
		scope:{
			messages : '='
		},
		link: function(scope, elem){

			scope.$watch(function(){
				return scope.messages.length;

			}, function(newValue, oldValue){
				var scrollHeight = elem.prop('scrollHeight');
				elem.prop('scrollTop', scrollHeight);
			});
		}
	};
});
