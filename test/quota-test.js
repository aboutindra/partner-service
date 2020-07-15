const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();
const expect = chai.expect;
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/quotas";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get All Partner Quota", _ => {
    it("Sending get all quota request without query parameters and respond no quota(s) was found", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }

        sandbox.stub(pgPool.prototype, 'query').onFirstCall().resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all quota request without query parameters and respond list of quota", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    partnerCode: "IDH",
                    remainingQuotaPerDay: null,
                    remainingQuotaPerMonth: null
                },
                {
                    partnerCode: 'BRI',
                    remainingQuotaPerDay: 1000000,
                    remainingQuotaPerMonth: 100000000
                }
            ]
        }
        let countResult = {
            rowCount: 2,
            rows: [
                {
                    count: 2
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Partner quota(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all quota request without query parameters and count query was failed", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    partnerCode: "IDH",
                    remainingQuotaPerDay: null,
                    remainingQuotaPerMonth: null
                },
                {
                    partnerCode: 'BRI',
                    remainingQuotaPerDay: 1000000,
                    remainingQuotaPerMonth: 100000000
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all quota request without query parameters and main query was failed", done => {
        let pool = sandbox.stub(pgPool.prototype, 'query');
        pool.onFirstCall().rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all quota request with invalid page query paramater", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all quota request with invalid limit query paramater", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ limit: -2 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all quota request with valid page and limit query paramater", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    partnerCode: "IDH",
                    remainingQuotaPerDay: null,
                    remainingQuotaPerMonth: null
                },
                {
                    partnerCode: 'BRI',
                    remainingQuotaPerDay: 1000000,
                    remainingQuotaPerMonth: 100000000
                }
            ]
        }
        let countResult = {
            rowCount: 2,
            rows: [
                {
                    count: 2
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 2, limit: 1 })
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Partner quota(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all quota request with valid page query paramater", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    partnerCode: "IDH",
                    remainingQuotaPerDay: null,
                    remainingQuotaPerMonth: null
                },
                {
                    partnerCode: 'BRI',
                    remainingQuotaPerDay: 1000000,
                    remainingQuotaPerMonth: 100000000
                }
            ]
        }
        let countResult = {
            rowCount: 2,
            rows: [
                {
                    count: 2
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 2 })
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Partner quota(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all quota request with valid limit query paramater", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    partnerCode: "IDH",
                    remainingQuotaPerDay: null,
                    remainingQuotaPerMonth: null
                },
                {
                    partnerCode: 'BRI',
                    remainingQuotaPerDay: 1000000,
                    remainingQuotaPerMonth: 100000000
                }
            ]
        }
        let countResult = {
            rowCount: 2,
            rows: [
                {
                    count: 2
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ limit: 10 })
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Partner quota(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Partner Quota", _ => {
    let PARAMS = "IDH";

    it("Sending get quota request with no quota(s) was found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }

        sandbox.stub(pgPool.prototype, 'query').onFirstCall().resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner quota not found", false, 404);
            done();
        });
    });

    it("Sending get quota request when database error occured", done => {
        sandbox.stub(pgPool.prototype, 'query').onFirstCall().rejects();

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get quota request with valid partner parameter", done => {
        let queryResult = {
            rowCount: 0,
            rows: [
                {
                    "partnerCode": "IDH",
                    "remainingQuotaPerDay": 99800,
                    "remainingQuotaPerMonth": null
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').onFirstCall().resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner quota(s) retrieved");
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Deduct Partner Quota", _ => {
    let PARAMS = "IDH";

    it("Sending deduct partner quota request without body parameter", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending deduct partner quota request with invalid daily quota deduction", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ dailyQuotaDeduction: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending deduct partner quota request with invalid monthly quota deduction", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ monthlyQuotaDeduction: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending deduct partner quota request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ monthlyQuotaDeduction: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending deduct partner quota request with partner quota not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ monthlyQuotaDeduction: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner quota not found", false, 404);
            done();
        });
    });

    it("Sending deduct partner quota request with valid parameter", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ dailyQuotaDeduction: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner quota deducted", true, 200);
            done();
        });
    });
});

describe("Insert or Update Partner Quota", _ => {
    it("Sending insert or update request without body parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert or update request with invalid remaining quota per month parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerMonth: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert or update request with invalid remaining quota per day parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerDay: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert or update request without remaining quota per day and remaining quota per month  parameters", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner quota added", true, 201);
            done();
        });
    });

    it("Sending insert or update request without remaining quota per day parameters", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerMonth: 10000 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner quota added", true, 201);
            done();
        });
    });

    it("Sending insert or update request without remaining quota per month parameters", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerDay: 10000 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner quota added", true, 201);
            done();
        });
    });

    it("Sending insert or update request with partner quota not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerDay: 10000 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed add new partner quota", false, 404);
            done();
        });
    });

    it("Sending insert or update request with partner code not exist response", done => {
        let error = {
            code: '23503'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerDay: 10000 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner doesn't exist", false, 403);
            done();
        });
    });

    it("Sending insert or update request with partner quota not found response", done => {
        let error = {
            code: '00'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDH", remainingQuotaPerDay: 10000 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending hearthbeat request", done => {

        chai.request(server)
        .get("/")
        .end((error, response) => {
            responseValidator.validateResponse(response, "Service is active", true, 200);
            done();
        });
    });
});
