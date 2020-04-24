const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/programs";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');
const CostBearerType = require('../enum/costBearerType');

chai.use(chaiHttp);

describe("Get Partner Program", _ => {
    it("Sending get partner program request with invalid id query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ id: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get partner program request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 2 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get partner program request with empty partner program detail", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 2 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner program not found", false, 404);
            done();
        });
    });

    it("Sending get partner program request with partner program detail", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 2,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": null,
                    "maximumAmountPerTransaction": null,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": false,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T04:39:26.146Z",
                    "updatedAt": "2019-12-04T05:36:16.692Z",
                    "deactivatedAt": "2019-12-04T05:36:16.692Z"
                }
            ]
        }

        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 2 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner program(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partner Programs", () => {
    it("Sending get all partner program request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partner program request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partner program request with database connection failure (main query)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all partner program request with database connection failure (count query)", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 6,
                    "partnerCode": "TKS",
                    "exchangeRate": 5,
                    "minimumAmountPerTransaction": 10,
                    "maximumAmountPerTransaction": 100,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": true,
                    "startDate": "2020-01-09T17:00:00.000Z",
                    "endDate": "2020-02-29T17:00:00.000Z",
                    "createdAt": "2020-01-10T07:22:51.255Z",
                    "updatedAt": "2020-01-10T07:22:51.255Z",
                    "deactivatedAt": null
                }
            ]
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query')
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all partner program request with empty partner program list", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        poolStub.onFirstCall().resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner program(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all partner program request with partner program list (without query parameters)", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 6,
                    "partnerCode": "TKS",
                    "exchangeRate": 5,
                    "minimumAmountPerTransaction": 10,
                    "maximumAmountPerTransaction": 100,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": true,
                    "startDate": "2020-01-09T17:00:00.000Z",
                    "endDate": "2020-02-29T17:00:00.000Z",
                    "createdAt": "2020-01-10T07:22:51.255Z",
                    "updatedAt": "2020-01-10T07:22:51.255Z",
                    "deactivatedAt": null
                },
                {
                    "id": 5,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": 10000,
                    "maximumAmountPerTransaction": 10000,
                    "maximumTransactionAmountPerDay": 30000,
                    "maximumTransactionAmountPerMonth": 100000,
                    "isActive": true,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T05:42:15.768Z",
                    "updatedAt": "2019-12-04T05:42:15.768Z",
                    "deactivatedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 100
                }
            ]
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner program(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all partner program request with partner program list (without query parameters)", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 6,
                    "partnerCode": "TKS",
                    "exchangeRate": 5,
                    "minimumAmountPerTransaction": 10,
                    "maximumAmountPerTransaction": 100,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": true,
                    "startDate": "2020-01-09T17:00:00.000Z",
                    "endDate": "2020-02-29T17:00:00.000Z",
                    "createdAt": "2020-01-10T07:22:51.255Z",
                    "updatedAt": "2020-01-10T07:22:51.255Z",
                    "deactivatedAt": null
                },
                {
                    "id": 5,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": 10000,
                    "maximumAmountPerTransaction": 10000,
                    "maximumTransactionAmountPerDay": 30000,
                    "maximumTransactionAmountPerMonth": 100000,
                    "isActive": true,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T05:42:15.768Z",
                    "updatedAt": "2019-12-04T05:42:15.768Z",
                    "deactivatedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 100
                }
            ]
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 2, limit: 2 })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner program(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get All Programs of a Partner with invalid page and limit", () => {
    let PARAMS = 'LKJ';
    it("Sending get all programs of a partner request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .query({ page: 0, limit: 100})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all programs of a partner request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .query({ page: 1, limit: 0})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });
})

describe("Get All Programs of a Partner", _ => {
    let PARAMS = 'LKJ';
    it("Sending get all programs of a partner request with database connection failure (main query)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all programs of a partner request with database connection failure (count query)", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 2,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": null,
                    "maximumAmountPerTransaction": null,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": false,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T04:39:26.146Z",
                    "updatedAt": "2019-12-04T05:36:16.692Z",
                    "deactivatedAt": "2019-12-04T05:36:16.692Z"
                }
            ]
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query')
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().rejects();

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all programs of a partner request with empty partner program list", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        poolStub.onFirstCall().resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner program(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all programs of a partner request with partner program list (without query parameters)", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 2,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": null,
                    "maximumAmountPerTransaction": null,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": false,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T04:39:26.146Z",
                    "updatedAt": "2019-12-04T05:36:16.692Z",
                    "deactivatedAt": "2019-12-04T05:36:16.692Z"
                },
                {
                    "id": 5,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": 10000,
                    "maximumAmountPerTransaction": 10000,
                    "maximumTransactionAmountPerDay": 30000,
                    "maximumTransactionAmountPerMonth": 100000,
                    "isActive": true,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T05:42:15.768Z",
                    "updatedAt": "2019-12-04T05:42:15.768Z",
                    "deactivatedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 100
                }
            ]
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner program(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all programs of a partner request with partner program list (with query parameters)", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 2,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": null,
                    "maximumAmountPerTransaction": null,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": false,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T04:39:26.146Z",
                    "updatedAt": "2019-12-04T05:36:16.692Z",
                    "deactivatedAt": "2019-12-04T05:36:16.692Z"
                },
                {
                    "id": 5,
                    "partnerCode": "LKJ",
                    "exchangeRate": 1,
                    "minimumAmountPerTransaction": 10000,
                    "maximumAmountPerTransaction": 10000,
                    "maximumTransactionAmountPerDay": 30000,
                    "maximumTransactionAmountPerMonth": 100000,
                    "isActive": true,
                    "startDate": "2019-11-25T17:00:00.000Z",
                    "endDate": "2020-02-03T17:00:00.000Z",
                    "createdAt": "2019-12-04T05:42:15.768Z",
                    "updatedAt": "2019-12-04T05:42:15.768Z",
                    "deactivatedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 100
                }
            ]
        }
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .query({ page: 2, limit: 2 })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "Partner program(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Delete Partner Program", _ => {
    let PARAMS = 2;

    it("Sending delete partner program request with invalid id parameter format (string)", done => {
        let PARAMS = 'string';
        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete partner program request with invalid id parameter (lower than 1)", done => {
        let PARAMS = 0;
        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete partner program request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete partner program request with non existed program id", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner program not found", false, 404);
            done();
        });
    });

    it("Sending delete partner program request with valid program id", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner program deleted", true, 200);
            done();
        });
    });
});

describe("Add Partner Program", _ => {
    it("Sending add partner program request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request without partner code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ exchangeRate: 10, costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request without exchange rate parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request without cost bearer type parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AESTK", exchangeRate: 10, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request without start date parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", costBearerType: CostBearerType.PARTNER, exchangeRate: 10, endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request without end date parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", exchangeRate: 10, costBearerType: CostBearerType.PARTNER, startDate: new Date() })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request with invalid partner code length", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AESTRIK", exchangeRate: 10, costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request with invalid exchange rate value", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", exchangeRate: 0, costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request with invalid limit transaction parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", exchangeRate: 10, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000), minAmountPerTransaction: 0, maxAmountPerTransaction: 0,
        maxTransactionAmountPerDay: 0, maxTransactionAmountPerMonth: 0,  costBearerType: CostBearerType.PARTNER })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request with invalid date range parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", exchangeRate: 10, costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date() })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add partner program request with database connection failure (current active program query)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", exchangeRate: 10, costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending add partner program request when another program already running", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query')
        let currentProgramQuery = {
            rowCount: 1,
            rows: [
                {
                    "id": 6,
                    "partnerCode": "TKS",
                    "exchangeRate": 5,
                    "minimumAmountPerTransaction": 10,
                    "maximumAmountPerTransaction": 100,
                    "maximumTransactionAmountPerDay": null,
                    "maximumTransactionAmountPerMonth": null,
                    "isActive": true,
                    "startDate": "2020-01-09T17:00:00.000Z",
                    "endDate": "2020-02-29T17:00:00.000Z",
                    "createdAt": "2020-01-10T07:22:51.255Z",
                    "updatedAt": "2020-01-10T07:22:51.255Z",
                    "deactivatedAt": null
                }
            ]
        }
        poolStub.onFirstCall().resolves(currentProgramQuery);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AEST", exchangeRate: 10, costBearerType: CostBearerType.PARTNER, startDate: new Date(), endDate: new Date(Date.now() + 1000 * 1000) })
        .end((error, response) => {
            poolStub.restore();
            responseValidator.validateResponse(response, "There is another program currently running", false, 403);
            done();
        });
    });
});
