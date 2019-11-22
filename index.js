const AppServer = require('./routes/routes');
const logger = require('./utilities/logger');
const appServer = new AppServer();
const port = process.env.PORT || 9070;

let listener = appServer.app.listen(port, _ => {
    logger.info("Service started, listening at " + listener.address().port);
});
