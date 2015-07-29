//routes and restful api
var MAX_USERS = 10;
var MAX_MESSAGES = 20;

var sqlBuilder = require('squel');
var uuid = require('uuid');
var fs = require('fs');

var sqlite3 = require('sqlite3').verbose();
var DATA_PATH = 'data/chat.db';
var logger = require('./logger').logger;

var runQuery = function(sql, callback){
	var db;
	try {
		db = new sqlite3.Database(DATA_PATH);
		db.all(sql, callback);
		db.close();
	} catch(e) {
		logger.error(e);
	}
};

exports.getAllUsers = function(req, res){
	var sql = sqlBuilder
		.select()
		.from('users')
		.field('id')
		.field('name')
		.field('role')
		.field('online_state', 'online')
		.toString();
	runQuery(sql, function(err, data){
		if(err) {
			logger.error(err);
			res.writeHead(404);
		} else {
			res.send(data);
		}
	});

};

exports.getMatchUser = function(req, res){

	var sql = sqlBuilder
		.select()
		.from('users')
		.field('count(*)', 'count')
		.field('id')
		.where(' name =? and password =? ', req.body.name, req.body.password)
		.toString();

	runQuery(sql, function(err, data){
		if(err) {
			logger.error((err));
		}

		if(data[0].hasOwnProperty('count') && data[0].count > 0) {
			var sqlUpdate = sqlBuilder
				.update()
				.table('users')
				.set('online_state', 1)
				.where('id=? ', data[0].id)
				.toString();
			runQuery(sqlUpdate);
		}
		if(data[0].count > 0) {
			res.send({login : true, userId : data[0].id});
		} else {
			res.send({login : false})
		}
	});
};

exports.getUserById = function(req, res){
	var sql = sqlBuilder.select().from('users').where(' id =? ', req.params.id).toString();
	runQuery(sql, function(err, data){
		err ? logger.error(err) : res.send(data);
	});
};

exports.addUser = function(req, res){
	var userId = uuid.v4();
	req.body['id'] = userId;
	var sql = sqlBuilder
		.insert()
		.into('users')
		.setFieldsRows([req.body])
		.toString();
	runQuery(sql, function(err){
		if(err) {
			res.sendStatus(500);
		} else {
			res.send({userId : userId});
		}
	});

};

exports.getMessageById = function(req, res){
	var sql = sqlBuilder.select().from('chats').where(' id =? ', req.params.id).toString();
	runQuery(sql, function(err, data){
		err ? logger.error(err) : res.send(data);
	});
};

exports.getMessages = function(req, res){
	var sql = sqlBuilder
		.select()
		.from('chats')
		.from('users')
		.field('chats.id', 'id')
		.field('chats.from_id', 'from')
		.field('users.name', 'author')
		.field('chats.message', 'message')
		.field('chats.date', 'date')
		.where('chats.from_id = users.id')
		.toString();
	runQuery(sql, function(err, data){
		err ? logger.error(err) : res.send(data);
	});
};

exports.addMessage = function(req, res){
	var messageId = uuid.v4();
	req.body['id'] = messageId;
	var sql = sqlBuilder
		.insert()
		.into('chats')
		.setFieldsRows([req.body])
		.toString();
	runQuery(sql, function(err) {
		if(err) {
			logger.error(err);
		} else {
			res.send({messageId : messageId})
		}
	});
};

exports.userLogOut = function(req, res) {
	var sql = sqlBuilder
		.update()
		.table('users')
		.set('online_state', 0)
		.where(' name =? and password =? ', req.body.name, req.body.password)
		.toString();

	runQuery(sql, function(err, data){
		if(err) {
			res.sendStatus(404);
		} else {
			res.sendStatus(204);
		}
	});
};

exports.serverCallLogOut = function(userId){
	//todo: move to dao layer
	var sql = sqlBuilder
		.update()
		.table('users')
		.set('online_state', 0)
		.where(' id =? ', userId)
		.toString();
	runQuery(sql, function(err){
		if(err) {
			logger.error('Got error at serverSideCallLogOut :' + err)
		}
	});
};

exports.getPaint = function(req, res){
	var data = fs.readFileSync('./data/img.text');
	res.send(data);
};
var savePaintData = function(data){
	fs.writeFileSync('./data/img.text', data);
};
exports.savePaint = function(req, res){
	var picData = req.body.pic;
	savePaintData(picData);
	res.sendStatus(200);
};
exports.savePaintData = savePaintData;
