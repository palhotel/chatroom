//routes and restful api
var sqlBuilder = require('squel');
var uuid = require('uuid');

var sqlite3 = require('sqlite3').verbose();
var DATA_PATH = 'data/chat.db';

var runQuery = function(sql, callback){
	var db;
	try {
		db = new sqlite3.Database(DATA_PATH);
		db.all(sql, callback);
		db.close();
	} catch(e) {
		console.log('chat room exception : ', e);
	}
};

exports.getAllUsers = function(req, res){
	var sql = sqlBuilder.select().from("users").toString();
	runQuery(sql, function(err, data){
		err ? console.log('At get all users' + err) : res.send(data);
	});
};

exports.getUserById = function(req, res){
	console.log('addUser', req.params.id || '');
};

exports.addUser = function(req, res){
};

exports.getMessageById = function(req, res){

};

exports.getMessages = function(req, res){
};

exports.addMessage = function(req, res){
};
