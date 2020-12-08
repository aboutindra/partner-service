const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/partners";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Active Issuers", _ => {
    const PARAMS = '/active-issuers';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all active issuers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active issuers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active issuers request with connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all active issuers request with empty partner list", done => {
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

    it("Sending get all active issuers request with valid query parameter", done => {  
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

    it("Sending get all active issuers request without query parameter", done => {       
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

describe("Get Active Issuer", _ => {
    const PARAMS = '/active-issuers/IDH';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get issuer request with empty issuer response", done => {
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
            responseValidator.validateResponse(response, "Issuer not found", false, 404);
            done();
        });
    });

    it("Sending get issuer request with database connection failure", done => {
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

    it("Sending get issuer request with empty issuer response", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "costType": "fixed",
                    "costAmount": "300.00",
                    "exchangeRate": 10,
                    "minimumAmountPerTransaction": null,
                    "maximumAmountPerTransaction": null,
                    "remainingDeductionQuotaPerDay": 99800,
                    "remainingDeductionQuotaPerMonth": null
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
            responseValidator.validateResponse(response, "Issuer retrieved", true, 200);
            done();
        });
    });
});

describe("Get Issuers", _ => {
    const PARAMS = '/issuers';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all issuers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all issuers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all issuers request with connection failure response", done => {
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

    it("Sending get all issuers request with empty partner list", done => {
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

    it("Sending get all issuers request with valid query parameter", done => {
        const queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPackageId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                },
                {
                    "code": "TKS",
                    "segmentId": 6,
                    "issuerCostPackageId": 3,
                    "acquirerCostPackageId": null,
                    "name": "telkomsel",
                    "urlLogo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T06:40:00.013Z",
                    "updatedAt": "2019-12-04T06:40:00.013Z",
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

    it("Sending get all issuers request without query parameter", done => {
        const queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPackageId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                },
                {
                    "code": "TKS",
                    "segmentId": 6,
                    "issuerCostPackageId": 3,
                    "acquirerCostPackageId": null,
                    "name": "telkomsel",
                    "urlLogo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T06:40:00.013Z",
                    "updatedAt": "2019-12-04T06:40:00.013Z",
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

describe("Get Active Issuers Config", _ => {
    const PARAMS = '/active-issuers-config';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all active issuers config request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active issuers config request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active issuers config request with connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all active issuers config request with empty partner list", done => {        
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

    it("Sending get all active issuers config request with valid query parameter", done => {
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

    it("Sending get all active issuers config request without query parameter", done => {
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
