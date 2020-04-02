const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/partners";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Active Acquirers", _ => {
    let PARAMS = '/active-acquirers';

    it("Sending get all active acquirers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active acquirers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active acquirers request with connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all active acquirers request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all active acquirers request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "name": "indihome",
                    "logo": "partner/logo-myindihome.svg",
                    "unit": "Poin"
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 10
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all active acquirers request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "name": "indihome",
                    "logo": "partner/logo-myindihome.svg",
                    "unit": "Poin"
                },
                {
                    "code": "TKS",
                    "name": "telkomsel",
                    "logo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin"
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Active Acquirer", _ => {
    let PARAMS = '/active-acquirers/LKJ';

    it("Sending get acquirer request with empty acquirer response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Acquirer not found", false, 404);
            done();
        });
    });

    it("Sending get acquirer request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get acquirer request with empty acquirer response", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "LKJ",
                    "costType": "fixed",
                    "costAmount": "15.00",
                    "exchangeRate": 1
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Acquirer retrieved", true, 200);
            done();
        });
    });
});

describe("Get Acquirers", done => {
    let PARAMS = '/acquirers';

    it("Sending get all acquirers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all acquirers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all acquirers request with connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all acquirers request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all acquirers request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "INP",
                    "segmentId": 7,
                    "issuerCostPackageId": null,
                    "acquirerCostPackageId": 2,
                    "name": "inpoin",
                    "urlLogo": "partner/inpoin_logo.png",
                    "unit": "Saldo Inpoin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:49:57.828Z",
                    "updatedAt": "2019-12-04T04:03:57.156Z",
                    "deletedAt": null
                },
                {
                    "code": "LKJ",
                    "segmentId": 1,
                    "issuerCostPackageId": null,
                    "acquirerCostPackageId": 3,
                    "name": "linkaja",
                    "urlLogo": "partner/logo-linkaja.svg",
                    "unit": "Saldo Bonus",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T03:22:20.176Z",
                    "updatedAt": "2019-12-04T04:02:19.471Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 10
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 2 })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all acquirers request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "INP",
                    "segmentId": 7,
                    "issuerCostPackageId": null,
                    "acquirerCostPackageId": 2,
                    "name": "inpoin",
                    "urlLogo": "partner/inpoin_logo.png",
                    "unit": "Saldo Inpoin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:49:57.828Z",
                    "updatedAt": "2019-12-04T04:03:57.156Z",
                    "deletedAt": null
                },
                {
                    "code": "LKJ",
                    "segmentId": 1,
                    "issuerCostPackageId": null,
                    "acquirerCostPackageId": 3,
                    "name": "linkaja",
                    "urlLogo": "partner/logo-linkaja.svg",
                    "unit": "Saldo Bonus",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T03:22:20.176Z",
                    "updatedAt": "2019-12-04T04:02:19.471Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});
