const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/partners";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Active Partners", _ => {
    let BASE_URL = "/api/v1/active-partners";

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
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all active partners request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all active partners request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
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
        .get(BASE_URL)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all active partners request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
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
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 4
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partner", _ => {
    it("Sending get partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "AFK" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get partner request with empty partner response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "AFK" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get partner request with partner detail response", done => {
        let queryResult = {
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
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "IDH" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partners", () => {
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
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all partners request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all partners request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
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
        .get(BASE_URL)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all partners request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
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
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 4
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner(s) retrieved", true, 200);
            done();
        });
    });

});

describe("Delete a Partner", _ => {
    let PARAMS = '/IDH';

    it("Sending delete partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete partner request with empty partner response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner not found", false, 404);
            done();
        });
    });

    it("Sending delete partner request with valid partner code", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner deleted", true, 200);
            done();
        });
    });
});

describe("Update Partner", _ => {
    let PARAMS = '/IDH';

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
        .send({ segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without segment id parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without url logo parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request without unit parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update partner request with unavaliable foregin key id response", done => {
        let error = {
            code: "23503"
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Id not exist", false, 403);
            done();
        });
    });

    it("Sending update partner request with unavailable partner code response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner not found", false, 404);
            done();
        });
    });

    it("Sending update partner request with valid partner code response", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'Indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner updated", true, 200);
            done();
        });
    });
});

describe("Add New Partner", _ => {
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
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without name parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without segment id parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without url logo parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, unit: 'Poin' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request without unit parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add new partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending add new partner request with unavaliable foregin key id response", done => {
        let error = {
            code: "23503"
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Id not exist", false, 403);
            done();
        });
    });

    it("Sending add new partner request with existed partner code parameter", done => {
        let error = {
            code: "23505"
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Code already exist", false, 403);
            done();
        });
    });

    it("Sending add new partner request with inserting data failure", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed add new partner", false, 404);
            done();
        });
    });

    it("Sending add new partner request with valid partner code response", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'Indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner added", true, 200);
            done();
        });
    });
});
