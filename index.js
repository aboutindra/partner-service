const AppServer = require('./routes/routes');
const logger = require('./utilities/logger');
const appServer = new AppServer();
const port = process.env.PORT || 9070;
const postgresqlWrapper = require('./databases/postgresql');

const server = appServer.app.listen(port, () => {
    logger.info("Service started, listening at " + port);
});

process.on('SIGTERM', () => {
	console.info('SIGTERM signal received');
	console.log('Closing http server...');

	//close server connection
	server.close(() => {
		console.log('Http server closed.');
        let pgPool = postgresqlWrapper.getConnection(process.env.POSTGRESQL_DATABASE_PARTNER);
		pgPool.end(() => {
            console.log("Database connection closed");
            process.exit(0);
        });
	});
});

module.exports = appServer.app;
