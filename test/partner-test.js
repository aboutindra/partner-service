const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/partners";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');
const CostBearerType = require('../enum/costBearerType');

chai.use(chaiHttp);

describe("Get Active Partners", _ => {
    const BASE_URL = "/api/v1/active-partners";
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all active partners request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active partners request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all active partners request with connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all active partners request with empty partner list", done => {
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
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all active partners request with valid query parameter", done => {
        const queryResult = {
            rowCount: 1,
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
        .get(BASE_URL)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all active partners request without query parameter", done => {
        const queryResult = {
            rowCount: 4,
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
                    count: 4
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
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partner", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get partner request with database connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "AFK" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get partner request with empty partner response", done => {
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
        .get(BASE_URL)
        .query({ code: "AFK" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get partner request with partner detail response", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPackageId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "partnerType": "Issuer",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "IDH" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partners", () => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all partners request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partners request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partners request with connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all partners request with empty partner list", done => {
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
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all partners request with valid query parameter", done => {
        const queryResult = {
            rowCount: 1,
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
        .get(BASE_URL)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all partners request without query parameter", done => {
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
                }
            ]
        }
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 4
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
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

});

describe("Delete a Partner", _ => {
    const PARAMS = '/IDH';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending delete partner request with database connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete partner request with empty partner response", done => {
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
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner not found", false, 404);
            done();
        });
    });

    it("Sending delete partner request with valid partner code", done => {
        const queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner deleted", true, 200);
            done();
        });
    });
});

describe("Update Partner", _ => {
    const PARAMS = '/IDH';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending update partner request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without name parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without segment id parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without url logo parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without unit parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without cost package id parameter", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, isAcquirer: true, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without acquirer status parameter", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without issuer status parameter", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without cost bearer type parameter", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request with database connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update partner request with unavaliable foregin key id response", done => {
        const error = {
            code: "23503"
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Id not exist", false, 403);
            done();
        });
    });

    it("Sending update partner request with unavailable partner code response", done => {
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
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner not found", false, 404);
            done();
        });
    });

    it("Sending update partner request with valid partner code response", done => {
        const queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'Indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner updated", true, 200);
            done();
        });
    });
});

describe("Add New Partner", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending add new partner request without body parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without code parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without name parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without segment id parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without url logo parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, segmentId: 1, unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without unit parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without cost bearer type parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, urlLogo: 'partner/logo/idh-logo.png', unit: 'Coins' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request with invalid cost bearer type", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: 'unknown', urlLogo: 'partner/logo/idh-logo.png', unit: 'Coins' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request with database connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending add new partner request with unavaliable foregin key id response", done => {
        const error = {
            code: "23503"
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Id not exist", false, 403);
            done();
        });
    });

    it("Sending add new partner request with existed partner code parameter", done => {
        const error = {
            code: "23505"
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Code already exist", false, 403);
            done();
        });
    });

    it("Sending add new partner request with inserting data failure", done => {
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
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Failed add new partner", false, 404);
            done();
        });
    });

    it("Sending add new partner request with valid partner code response", done => {
        const queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'Indihome', segmentId: 1, costPackageId: 1, isAcquirer: true, isIssuer: true, costBearerType: CostBearerType.PARTNER, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner added", true, 200);
            done();
        });
    });
});

describe("Get Partner Counts", _ => {
    const PATH = '/counts';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get partner count request with database connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PATH)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get partner count request with empty partner response", done => {
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
        .get(BASE_URL + PATH)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner count not found", false, 404);
            done();
        });
    });

    it("Sending get partner count request with partner detail response", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPackageId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "partnerType": "Issuer",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PATH)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner counts retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partner Images", _ => {
    const PATH = '/images';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all partners image request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PATH)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partners image request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PATH)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partners image request with connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PATH)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all partners image request with empty partner list", done => {
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
        .get(BASE_URL + PATH)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all partners image request with valid query parameter", done => {
        const queryResult = {
            rowCount: 1,
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
                }
            ]
        }
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "ELM",
                    "urlLogo": "partner/Elang%20Miles.png"
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
        .get(BASE_URL + PATH)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner images retrieved", true, 200);
            done();
        });
    });

    it("Sending get all partners image request without query parameter", done => {
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
                }
            ]
        }
        const countResult = {
            rowCount: 6,
            rows: [
                {
                    "code": "ELM",
                    "urlLogo": "partner/Elang%20Miles.png"
                },
                {
                    "code": "IDH",
                    "urlLogo": "partner/logo-myindihome.svg"
                },
                {
                    "code": "INP",
                    "urlLogo": "partner/inpoin_logo.png"
                },
                {
                    "code": "LKJ",
                    "urlLogo": "partner/logo-linkaja.svg"
                },
                {
                    "code": "OMO",
                    "urlLogo": "partner/Omo%20Points.png"
                },
                {
                    "code": "TKS",
                    "urlLogo": "partner/logo-telkomsel-poin.svg"
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
        .get(BASE_URL + PATH)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner images retrieved", true, 200);
            done();
        });
    });
});
