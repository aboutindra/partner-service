const winston = require('winston');

const logger = winston.createLogger({
    transports: [ new winston.transports.Console({
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: true,
      format: winston.format.simple()
    })
    ],
    exitOnError: false
});

module.exports = logger;
