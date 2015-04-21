//node.js web server

var ENV = {
	PORT: 8000
};
var express = require('express');
var http = require('http');
var path = require('path');

var routes = require('./routes');
var less = require('less');

var app = express();
app.use(express.static(path.join(__dirname, 'src')));
app.listen(ENV.PORT);

app.get('/api/users', routes.getAllUsers);
app.get('/api/users/:id', routes.getUserById);
app.post('/api/users', routes.addUser);

app.get('/api/messages', routes.getMessages);
app.get('/api/messages/:id', routes.getMessageById);
app.post('/api/messages', routes.addMessage);


console.log('Server run at port:' + ENV.PORT);
