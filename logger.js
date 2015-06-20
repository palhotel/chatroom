var log4js = require('log4js');

log4js.configure({
	appenders: [
		{ type: 'console' },
		{
			type: 'file',
			filename: 'logs/access.log',//manually create it if there is no file.
			maxLogSize: 65536,
			backups:3,
			category: 'normal'
		}
	],
	replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

module.exports = {
	log4js : log4js,
	logger : logger
};
