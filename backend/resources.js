//restful api
var MAX_USERS = 25;
var MAX_MESSAGES = 100;
var sqlBuilder = require('squel');
var uuid = require('uuid');
var cachePaint = {};

function resources(fs, sqlite3, sqlConfig, config, logger) {
	var dataPath = sqlConfig.PATH;
	var runQuery = function (sql, callback) {
		var db;
		try {
			db = new sqlite3.Database(dataPath);
			db.all(sql, callback);
			db.close();
		} catch (e) {
			logger.error(e);
		}
	};

	var getAllUsers = function (req, res) {
		var sql = sqlBuilder
			.select()
			.from('users')
			.field('id')
			.field('name')
			.field('role')
			.field('online_state', 'online')
			.toString();
		runQuery(sql, function (err, data) {
			if (err) {
				logger.error(err);
				res.writeHead(404);
			} else {
				res.send(data);
			}
		});

	};

	var getMatchUser = function (req, res) {
		if (global.appRuntime.onlineUserCount >= MAX_USERS) {
			res.send({login: false, overMaxUsers: true});
		} else {
			var sql = sqlBuilder
				.select()
				.from('users')
				.field('count(*)', 'count')
				.field('id')
				.where(' name =? and password =? ', req.body.name, req.body.password)
				.toString();

			runQuery(sql, function (err, data) {
				if (err) {
					logger.error((err));
				}

				if (data[0].hasOwnProperty('count') && data[0].count > 0) {
					var sqlUpdate = sqlBuilder
						.update()
						.table('users')
						.set('online_state', 1)
						.where('id=? ', data[0].id)
						.toString();
					runQuery(sqlUpdate);
				}
				if (data[0].count > 0) {
					res.send({login: true, userId: data[0].id});
				} else {
					res.send({login: false})
				}
			});
		}
	};

	var getUserById = function (req, res) {
		var sql = sqlBuilder.select().from('users').where(' id =? ', req.params.id).toString();
		runQuery(sql, function (err, data) {
			err ? logger.error(err) : res.send(data);
		});
	};

	var addUser = function (req, res) {
		var userId = uuid.v4();
		req.body['id'] = userId;
		var sql = sqlBuilder
			.insert()
			.into('users')
			.setFieldsRows([req.body])
			.toString();
		runQuery(sql, function (err) {
			if (err) {
				res.sendStatus(500);
			} else {
				res.send({userId: userId});
			}
		});

	};

	var getMessageById = function (req, res) {
		var sql = sqlBuilder.select().from('chats').where(' id =? ', req.params.id).toString();
		runQuery(sql, function (err, data) {
			err ? logger.error(err) : res.send(data);
		});
	};

	var getMessages = function (req, res) {
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
		runQuery(sql, function (err, data) {
			err ? logger.error(err) : res.send(data);
		});
	};

	var addMessage = function (req, res) {
		var messageId = uuid.v4();
		req.body['id'] = messageId;
		var sql = sqlBuilder
			.insert()
			.into('chats')
			.setFieldsRows([req.body])
			.toString();
		runQuery(sql, function (err) {
			if (err) {
				logger.error(err);
			} else {
				res.send({messageId: messageId})
			}
		});
	};

	var userLogOut = function (req, res) {
		var sql = sqlBuilder
			.update()
			.table('users')
			.set('online_state', 0)
			.where(' name =? and password =? ', req.body.name, req.body.password)
			.toString();

		runQuery(sql, function (err, data) {
			if (err) {
				res.sendStatus(404);
			} else {
				res.sendStatus(204);
			}
		});
	};

	var serverCallLogOut = function (userId) {
		//todo: move to dao layer
		var sql = sqlBuilder
			.update()
			.table('users')
			.set('online_state', 0)
			.where(' id =? ', userId)
			.toString();
		runQuery(sql, function (err) {
			if (err) {
				logger.error('Got error at serverSideCallLogOut :' + err);
			}
		});
	};

	var clearOldMessages = function () {
		var sql = 'select count(*) as count from chats; ';
		runQuery(sql, function (err, data) {
			if (data && data[0].hasOwnProperty('count') && data[0].count > MAX_MESSAGES) {
				var delSql = 'delete from chats where id in (select id from chats order by date limit '
					+ (data[0].count - MAX_MESSAGES) + '); ';
				runQuery(delSql, function (err) {
					if (err) {
						logger.error('Got error at clearOldMessages :' + err);
					}
				});
			}
		});
	};

	var getPaint = function (req, res) {
		var data;
		if (cachePaint.data) {
			data = cachePaint.data;
		} else {
			data = fs.readFileSync(config.IMG_FILE);
		}
		res.send(data);
	};

	var savePaintToFile = function () {
		if(cachePaint.data){
			fs.writeFileSync(config.IMG_FILE, cachePaint.data);
		}
	};

	var savePaint = function (req, res) {
		savePaintToMemory(req.body.pic);
		res.sendStatus(200);
	};

	var savePaintToMemory = function(data){
		cachePaint.data = data;
	};

	return {
		local : {
			savePaintToMemory : savePaintToMemory,
			savePaintToFile : savePaintToFile,
			clearOldMessages: clearOldMessages
		},
		savePaint: savePaint,
		getPaint: getPaint,
		serverCallLogOut: serverCallLogOut,
		userLogOut: userLogOut,
		addMessage: addMessage,
		getMessages: getMessages,
		getMessageById: getMessageById,
		addUser: addUser,
		getUserById: getUserById,
		getMatchUser: getMatchUser,
		getAllUsers: getAllUsers
	};
}

module.exports = resources;
