require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const responder = require('../utilities/responder');
const logger = require('../utilities/logger');
const postgreWrapper = require('../databases/postgresql/index');
const discount = require('./controllers/discount');
const costPackage = require('./controllers/costPackage');
const partner = require('./controllers/partner');
const partnerProgram = require('./controllers/partnerProgram');
const segment = require('./controllers/segment');
const partnerQuota = require('./controllers/partnerQuota');
const partnerWallet = require('./controllers/partnerWallet');

function AppServer() {
    this.app = express();
    //Body parser
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    this.app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token");
        res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,PATCH,OPTIONS");
        next();
    });

    this.app.use(function(req, res, next) {
        let ip = req.headers[ 'x-forwarded-for' ] || req.connection.remoteAddress;
        logger.info(`Request Ip: ${ip}`, "receive request");
        next();
    });

    //Local env
    if (process.env.NODE_ENV === 'dev')
    {
        this.app.use(morgan('dev'));
    }

    this.app.get('/', (request, response) => {
        responder.sendResponse(response, true, "Service is active", null, 200);
    })

    costPackage.routes(this.app);
    discount.routes(this.app);
    partner.routes(this.app);
    partnerProgram.routes(this.app);
    segment.routes(this.app);
    partnerQuota.routes(this.app);
    partnerWallet.routes(this.app);

    postgreWrapper.init();
}

module.exports = AppServer;
