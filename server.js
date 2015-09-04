//node.js web server
var CONFIG = require('./appconfig.json');
var SQL_CONFIG = require('./sql.json');

var fs = require('fs');
var bodyParser = require('body-parser');
var multer = require('multer');
var express = require('express');
var http = require('http');
var path = require('path');
var less = require('less');
var socketIO = require('socket.io');
var sqlite3 = require('sqlite3').verbose();
var favicon = require('serve-favicon');
var session = require('express-session');
var compression = require('compression')
var logs = require('./backend/logger');
var logger = logs.logger;

var app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, 'build')));
app.use(favicon(__dirname + '/build/favicon.ico'));
app.use(logs.log4js.connectLogger(logger, {level : 'auto'}));
app.use(session({
	secret: 'pepe',
	resave: false,
	saveUninitialized: true
}));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

var server = app.listen(CONFIG.PORT);

require('./backend/setup')(SQL_CONFIG, CONFIG, fs, sqlite3, logger);
var resources = require('./backend/resources')(fs, sqlite3, SQL_CONFIG, CONFIG, logger);
require('./backend/routes')(app, resources);
require('./backend/socketService')(socketIO, logger, resources, server);

global.appRuntime = {onlineUserCount : 0};

setInterval(function(){
	resources.local.clearOldMessages();
	resources.local.savePaintToFile();
}, 5000);

logger.info('Server is running at 127.0.0.1 with port:' + CONFIG.PORT);
