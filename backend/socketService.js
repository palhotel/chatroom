var socketIds = {};
function socketService(socketIO, logger, resources, server){
    var io = socketIO();
    io.on('connection', function(socket){
        logger.info('a user connected, socket.id : ' + socket.id);

        socket.on('disconnect', function(){
            logger.info('user disconnected, socket.id : ' + socket.id);
            if(socketIds[socket.id]) {
                resources.serverCallLogOut(socketIds[socket.id]);
                socketIds[socket.id] = null;
                global.appRuntime.onlineUserCount --;
                io.emit('server:someone-logout');
            }
        });

        socket.on('user:send-message', function() {
            io.emit('server:someone-sent');
        });

        socket.on('user:login', function(data){
            socketIds[socket.id] = data;
            global.appRuntime.onlineUserCount ++;
            io.emit('server:someone-login');
        });

        socket.on('user:logout', function(){
            global.appRuntime.onlineUserCount --;
            io.emit('server:someone-logout');
        });

        socket.on('user:save-paint', function(data){
            resources.local.savePaintToMemory(data);
            io.emit('server:someone-paint');
        })
    });
    io.listen(server);
}

module.exports = socketService;
