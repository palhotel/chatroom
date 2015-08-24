chatroom.factory('rest', ['$http', function($http){
    var getAllUsers = function(){
        return $http.get('/api/users');
    };

    var getAllChats = function(){
        return $http.get('/api/messages');
    };

    var userLogin = function(obj){
        return $http.post('/api/security/userlogin', obj);
    };

    var userLogout = function(obj){
        return $http.post('/api/security/userlogout', obj);
    };

    var createUser = function(obj){
        return $http.post('/api/users', obj);
    };

    var sendMessage = function(obj){
        return $http.post('/api/messages', obj);
    };

    var getPicture = function(){
       return $http.get('/api/paint');
    };


    return {
        getUsers : getAllUsers,
        getChats : getAllChats,
        userLogin : userLogin,
        createUser : createUser,
        userLogout : userLogout,
        sendMessage : sendMessage,
        getPicture : getPicture
    };
}]);
