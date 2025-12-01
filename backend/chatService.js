var Q = require('q');
var sqlBuilder = require('squel');
var uuid = require('uuid');

var cachePaint = {};

function chatService(fs, sqlite3, sqlConfig, config, logger){
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

	var getAllUsers = function(){
		var defer = Q.defer();
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
				defer.reject(err);
			} else {
				defer.resolve(data);
			}
		});
		return defer.promise;
	};

	var getMatchUser = function (name, password) {
		var defer = Q.defer();
		var sql = sqlBuilder
			.select()
			.from('users')
			.field('count(*)', 'count')
			.field('id')
			.field('name')
			.where(' name =? and password =? ', name, password)
			.toString();

		runQuery(sql, function (err, data) {
			if (err) {
				defer.reject(err);
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
				defer.resolve({login: true, userId: data[0].id, userName: data[0].name});
			} else {
				defer.resolve({login: false})
			}
		});
		return defer.promise;
	};

	var getUserById = function (userId, res) {
		var defer = Q.defer();
		var sql = sqlBuilder.select().from('users').where(' id =? ', userId).toString();
		runQuery(sql, function (err, data) {
			if(err){
				defer.reject(err);
			} else {
				defer.resolve(data);
			}
		});
		return defer.promise;
	};

	var addUser = function (body) {
		var defer = Q.defer();
		var userId = uuid.v4();
		body['id'] = userId;
		var sql = sqlBuilder
			.insert()
			.into('users')
			.setFieldsRows([body])
			.toString();
		runQuery(sql, function (err) {
			if (err) {
				defer.reject(err);
			} else {
				defer.resolve({userId: userId});
			}
		});
		return defer.promise;

	};

	var getMessageById = function (userId) {
		var defer = Q.defer();
		var sql = sqlBuilder.select().from('chats').where(' id =? ', userId).toString();
		runQuery(sql, function (err, data) {
			if(err){
				defer.reject(err);
			} else {
				defer.resolve(data);
			}
		});
		return defer.promise;
	};

	var getMessages = function () {
		var defer = Q.defer();
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
			if(err){
				defer.reject(err);
			} else {
				defer.resolve(data);
			}
		});
		return defer.promise;
	};

	var addMessage = function (body) {
		var defer = Q.defer();
		var messageId = uuid.v4();
		body['id'] = messageId;
		var sql = sqlBuilder
			.insert()
			.into('chats')
			.setFieldsRows([body])
			.toString();
		runQuery(sql, function (err) {
			if (err) {
				defer.reject(err);
			} else {
				defer.resolve({messageId: messageId})
			}
		});
		return defer.promise;
	};

	var userLogOut = function (name, password) {
		var defer = Q.defer();
		var sql = sqlBuilder
			.update()
			.table('users')
			.set('online_state', 0)
			.where(' name =? and password =? ', name, password)
			.toString();

		runQuery(sql, function (err, data) {
			if (err) {
				defer.reject(err);
			} else {
				defer.resolve(true);
			}
		});
		return defer.promise;
	};

	var serverCallLogOut = function (userId) {
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
			if (data && data[0].hasOwnProperty('count') && data[0].count > config.MAX_MESSAGES) {
				var delSql = 'delete from chats where id in (select id from chats order by date limit '
					+ (data[0].count - config.MAX_MESSAGES) + '); ';
				runQuery(delSql, function (err) {
					if (err) {
						logger.error('Got error at clearOldMessages :' + err);
					}
				});
			}
		});
	};

	var getPaint = function () {
		var defer = Q.defer();
		var data;
		if (cachePaint.data) {
			data = cachePaint.data;
		} else {
			data = fs.readFileSync(config.IMG_FILE);
		}
		defer.resolve(data);
		return defer.promise;
	};

	var savePaintToFile = function () {
		if(cachePaint.data){
			fs.writeFileSync(config.IMG_FILE, cachePaint.data);
		}
	};

	var savePaintToMemory = function(data){
		cachePaint.data = data;
	};

	return {
		getAllUsers: getAllUsers,
		getMatchUser: getMatchUser,
		getUserById: getUserById,
		addUser: addUser,
		getMessageById: getMessageById,
		getMessages: getMessages,
		addMessage: addMessage,
		userLogOut: userLogOut,
		serverCallLogOut: serverCallLogOut,
		savePaintToMemory : savePaintToMemory,
		savePaintToFile : savePaintToFile,
		getPaint: getPaint,
		clearOldMessages: clearOldMessages
	};
}

module.exports = chatService;
