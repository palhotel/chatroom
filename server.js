//node.js web server

var ENV = {
	PORT: 8000
};

var bodyParser = require('body-parser');
var multer = require('multer');
var express = require('express');
var http = require('http');
var path = require('path');
var less = require('less');

var routes = require('./routes');
var logs = require('./logger');

var app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(logs.log4js.connectLogger(logs.logger, {level : 'auto'}));

app.listen(ENV.PORT);

app.get('/api/users', routes.getAllUsers);
app.get('/api/users/:id', routes.getUserById);
app.post('/api/users', routes.addUser);

app.post('/api/security/userlogin', routes.getMatchUser);
app.post('/api/security/userlogout', routes.userLogOut);

app.get('/api/messages', routes.getMessages);
app.get('/api/messages/:id', routes.getMessageById);
app.post('/api/messages', routes.addMessage);


logs.logger.info('Server is running at 127.0.0.1 with port:' + ENV.PORT);
