module.exports = [
    '$scope',
    '$q',
    '$cookieStore',
    'socketService',
    'rest',
    function ($scope, $q, $cookieStore, socketService, rest) {

        $scope.title = 'Free to Chat';
        $scope.users = [];
        $scope.chats = [];

        var hotkeys = {
            ctrl: false,
            enter: false
        };

        var resetStatus = function () {
            $scope.statusMessage = 'Free to login, If your name is occupied, please input the password, ' +
            'otherwise input a new name and remember your password.';
            $scope.me = {
                name: 'Me'
            };
            $scope.alreadyLogin = false;
        };

        var getOnlineUsers = function (users) {
            var newArray = [];
            users.map(function (item) {
                if (item.hasOwnProperty('online') && item.online === 1) {
                    newArray.push(item);
                }
            });
            return newArray;
        };

        var saveLoginInfo = function (userId, name, pass) {
            $scope.alreadyLogin = true;
            $scope.me.name = name;
            $scope.me.userId = userId;
            $cookieStore.put('user', $scope.me);
            if (pass) {
                $cookieStore.put('token', Base64.encode($scope.me.name + ':' + pass + 'chatroom'));
            }
        };

        var getSavedInfo = function () {
            var savedToken = $cookieStore.get('token');
            if (savedToken) {
                $scope.alreadyLogin = true;
                tryLogin('', '', savedToken);
            }
        };

        var updateUserList = function () {
            rest.getUsers()
                .then(function (res) {
                    $scope.users = getOnlineUsers(res.data);
                });
        };

        var updateMessages = function () {
            rest.getChats()
                .then(function (res) {
                    $scope.chats = res.data;
                });
        };

        var configWebSocket = function (socket) {
            socket.on('server:someone-login', function () {
                updateUserList();
            });
            socket.on('server:someone-logout', function () {
                updateUserList();
            });
            socket.on('server:someone-sent', function () {
                updateMessages();
            });
        };


        var tryLogin = function (name, pass, token) {
            token = token || '';
            rest.userLogin({name: name, password: pass, token: token})
                .then(function (res) {
                    if (res && res.data && res.data.login === true) {
                        saveLoginInfo(res.data.userId, res.data.userName, pass);
                        return null;
                    } else if (res && res.data && res.data.overMaxUsers === true) {
                        return {overMaxUsers: true};
                    } else {
                        return rest.createUser({name: name, password: pass, online_state: 1, role: 0});
                    }
                })
                .then(function (res) {
                    if (res && res.overMaxUsers === true) {
                        $scope.statusMessage = 'There are too many people in the room now ! please wait a moment and refresh';
                    } else {
                        if (res && res.data && res.data.userId) {
                            saveLoginInfo(res.data.userId, res.data.userName, pass);
                        }
                        $scope.users.push({name: $scope.me.name, online: 1});
                        $scope.statusMessage = 'Enjoy it !';
                        if ($scope.socket) {
                            $scope.socket.emit('user:login', $scope.me.userId);
                        }
                    }
                }, function (err) {
                    if (err) {
                        $scope.alreadyLogin = false;
                        $scope.statusMessage = 'Error:  login failed! Can you try another name ?';
                    }
                });
        };

        $scope.login = function () {
            tryLogin($scope.inputName, $scope.inputPass);
        };

        $scope.logout = function () {
            rest.userLogout({name: $scope.me.name, password: $scope.me.password})
                .then(function () {

                    for (var i = 0, l = $scope.users.length; i < l; i++) {
                        if ($scope.users[i].name && $scope.users[i].name === $scope.me.name) {
                            $scope.users.splice(i, 1);
                            break;
                        }
                    }
                    resetStatus();
                    $cookieStore.remove('token');
                    if ($scope.socket) {
                        $scope.socket.emit('user:logout');
                    }
                }, function () {
                    $scope.statusMessage = 'Error: logout failed';
                });
        };

        $scope.send = function () {
            if ($scope.inputMessage !== '') {
                var datetime = new Date().toLocaleString();
                rest.sendMessage({from_id: $scope.me.userId, message: $scope.inputMessage || ' ', date: datetime})
                    .then(function (res) {
                        $scope.inputMessage = '';
                        if ($scope.socket) {
                            $scope.socket.emit('user:send-message');
                        }
                    });
            }
        };

        $scope.keyDownHandler = function ($event) {
            if ($event.keyCode === 17) {
                hotkeys.ctrl = true;
            } else if ($event.keyCode === 13) {
                if (hotkeys.ctrl === true) {
                    $scope.send();
                }
            }
        };

        $scope.keyUpHandler = function ($event) {
            if ($event.keyCode === 17) {
                hotkeys.ctrl = false;
            } else if ($event.keyCode === 13) {
                hotkeys.enter = false;
            }
        };

        $scope.switchBoard = function () {
            $scope.wantDraw = !$scope.wantDraw;

        };

        $scope.shortnameToImage = function (text) {
            if (emojione && angular.isObject(emojione)) {
                return emojione.shortnameToImage(text);
            } else {
                return text;
            }
        };

        //Initializations
        resetStatus();
        updateUserList();
        updateMessages();
        getSavedInfo();

        $scope.socket = socketService.io;
        configWebSocket($scope.socket);

        $scope.loadingDone = true;

    }];
