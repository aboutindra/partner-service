const AppServer = require('./routes/routes');
const logger = require('./utilities/logger');
const appServer = new AppServer();
const port = process.env.PORT || 9070;

appServer.app.listen(port, () => {
    logger.info("Service started, listening at " + port);
})

module.exports = appServer.app;
