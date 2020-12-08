const express = require('express');
const bodyParser = require('body-parser');
const apm = require('elastic-apm-node');

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
const product = require('./controllers/product');
const productCategory = require('./controllers/productCategory');

function AppServer() {
    this.app = express();

    this.app.use(apm.middleware.connect());

    //Body parser
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    this.app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token");
        res.header('Access-Control-Allow-Methods', "GET, PUT, POST, DELETE, PATCH");
        next();
    });

    this.app.use(function(request, response, next) {
        logger.info(`IP addr ${request.connection.remoteAddress} request ${request.method} ${request.url}`);
        next();
    });

    /* Endpoint for heartbeat */
    this.app.get('/', (request, response) => {
        responder.sendResponse(response, true, "This service is running properly", null, 200);
    });

    postgreWrapper.init();

    costPackage.routes(this.app);
    discount.routes(this.app);
    partner.routes(this.app);
    partnerProgram.routes(this.app);
    segment.routes(this.app);
    partnerQuota.routes(this.app);
    partnerWallet.routes(this.app);
    product.routes(this.app);
    productCategory.routes(this.app);

}

module.exports = AppServer;
