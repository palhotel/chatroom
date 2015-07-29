chatroom.factory('socketService', function(){
    var socketIo = io();

    return {
        io : socketIo
    };
});
