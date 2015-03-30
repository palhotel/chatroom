//node.js web server

var ENV = {
	PORT: 8000
};
var express = require('express');

var app = express();
var chatRoomSrc = express.static(__dirname + '/src/');
app.use(chatRoomSrc);

app.listen(ENV.PORT);

console.log('Server run at port:' + ENV.PORT);
