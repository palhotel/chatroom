//node.js web server

var ENV = {
	PORT: 8000,
	PROTOCOL : 'http://',
	HOST: 'localhost'
};

var bodyParser = require('body-parser');
var multer = require('multer');
var express = require('express');
var http = require('http');
var path = require('path');
var less = require('less');
var socketIO = require('socket.io');
var routes = require('./routes');
var logs = require('./logger');

var app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(logs.log4js.connectLogger(logs.logger, {level : 'auto'}));

var server = app.listen(ENV.PORT);

app.get('/api/users', routes.getAllUsers);
app.get('/api/users/:id', routes.getUserById);
app.post('/api/users', routes.addUser);

app.post('/api/security/userlogin', routes.getMatchUser);
app.post('/api/security/userlogout', routes.userLogOut);

app.get('/api/messages', routes.getMessages);
app.get('/api/messages/:id', routes.getMessageById);
app.post('/api/messages', routes.addMessage);

app.get('/api/paint', routes.getPaint);
app.put('/api/paint,', routes.savePaint);

var io = socketIO();
var SELF_URL = ENV.PROTOCOL + ENV.HOST + ':' + ENV.PORT;
var socketIds = {};

io.on('connection', function(socket){
	logs.logger.info('a user connected, socket.id : ' + socket.id);

	socket.on('disconnect', function(){
		logs.logger.info('user disconnected, socket.id : ' + socket.id);
		if(socketIds[socket.id]) {
			routes.serverCallLogOut(socketIds[socket.id]);
			socketIds[socket.id] = null;
			io.emit('server:someone-logout');
		}
	});

	socket.on('user:send-message', function() {
		io.emit('server:someone-sent');
	});

	socket.on('user:login', function(data){
		socketIds[socket.id] = data;
		io.emit('server:someone-login');
	});

	socket.on('user:logout', function(){
		io.emit('server:someone-logout');
	});

	socket.on('user:save-paint', function(data){
		routes.savePaintData(data);
		io.emit('server:someone-paint');
	})
});

io.listen(server);
logs.logger.info('Server is running at 127.0.0.1 with port:' + ENV.PORT);
