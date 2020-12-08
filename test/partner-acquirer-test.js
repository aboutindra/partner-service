const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/partners";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Active Acquirers", _ => {
    const PARAMS = '/active-acquirers';
    afterEach(() => {
        sandbox.restore();
    });

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
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all active acquirers request with empty partner list", done => {
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all active acquirers request with valid query parameter", done => {
        const queryResult = {
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
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 10
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        pgPool.query.onSecondCall().resolves(countResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all active acquirers request without query parameter", done => {
        const queryResult = {
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
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        pgPool.query.onSecondCall().resolves(countResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Active Acquirer", _ => {
    const PARAMS = '/active-acquirers/LKJ';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get acquirer request with empty acquirer response", done => {
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Acquirer not found", false, 404);
            done();
        });
    });

    it("Sending get acquirer request with database connection failure", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get acquirer request with empty acquirer response", done => {
        const queryResult = {
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
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Acquirer retrieved", true, 200);
            done();
        });
    });
});

describe("Get Acquirers", done => {
    let PARAMS = '/acquirers';
    afterEach(() => {
        sandbox.restore();
    });

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
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all acquirers request with empty partner list", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all acquirers request with valid query parameter", done => {
        const queryResult = {
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
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 10
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        pgPool.query.onSecondCall().resolves(countResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 2 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all acquirers request without query parameter", done => {
        const queryResult = {
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
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        pgPool.query.onSecondCall().resolves(countResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});
