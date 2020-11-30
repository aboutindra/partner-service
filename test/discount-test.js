const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/discounts";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Active Discount", _ => {
    const BASE_URL = "/api/v1/active-discount/";
    const PARTNER_CODE = "AESTR";

    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get active discount request with invalid partner code", done => {
        chai.request(server)
        .get(BASE_URL + "ALJABAR")
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get active discount request with database connection failure", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARTNER_CODE)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get active discount request with active discount not found response", done => {
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
        .get(BASE_URL + PARTNER_CODE)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Active discount not found", false, 404);
            done();
        });
    });

    it("Sending get active discount request with active discount detail response", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + PARTNER_CODE)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Active discount retrieved", true, 200);
            done();
        });
    });
});

describe("Get Discount(s)", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get discount with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        })
    });

    it("Sending get discount with empty discount list response", done => {
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
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Discount not found", false, 404);
            done();
        })
    });

    it("Sending get discount", done => {
        const queryResult = {
            rowCount: 0,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
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
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Discount(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Discounts", () => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all discount with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        })
    });

    it("Sending get all discount with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 2, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        })
    });

    it("Sending get all discount with internal server error response", done => {
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
        })
    });

    it("Sending get all discount with empty discount list response", done => {
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
            responseValidator.validateResponse(response, "Discount(s) not found", false, 404);
            done();
        })
    });

    it("Sending get all discount with discount list response", done => {
        const queryResult = {
            rowCount: 0,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
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
        .end((error, response) => {
            responseValidator.validateResponse(response, "Discount(s) retrieved", true, 200);
            done();
        })
    });

    it("Sending get all discount (using query parameters)", done => {
        const queryResult = {
            rowCount: 0,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
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
        .query({ page: 1, limit: 1})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Discount(s) retrieved", true, 200);
            done();
        })
    });
});

describe("Delete Discount", _ => {
    const PARAMS = 'NEWYEAR5';
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending delete discount request with invalid discount code parameter", done => {
        chai.request(server)
        .delete(BASE_URL + '/' + 'ANONYMOUSDISCOUNTCODE')
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete discount request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete discount request with invalid discount code (code not exist)", done => {
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
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Discount not found", false, 404);
            done();
        });
    });

    it("Sending delete discount request with valid discount code", done => {
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
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Discount deleted", true, 200);
            done();
        });
    });
});

describe("Add Discount with Invalid Parameter", () => {
    it("Sending add discount request without body", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add discount request without discount code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add discount request without discount name parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add discount request without discount amount parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add discount request with discount code more than 10 characters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEARDISCOUNT5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add discount request with invalid deduction amount", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: -1, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending add discount request with invalid date parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: '', endDate: ''})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });
});

describe("Add Discount", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending add discount request when another discount already running", done => {
        const existingDiscount = {
            rowCount: 1,
            rows: [
                {

                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(existingDiscount);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "There is another program currently running", false, 403);
            done();
        });
    });

    it("Sending add discount request with internal server error response on current active query", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending add discount request with internal server error response", done => {
        const existingDiscount = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(existingDiscount);
        pgPool.query.onSecondCall().rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending add discount request with invalid type value response", done => {
        const existingDiscount = {
            rowCount: 0,
            rows: []
        }
        const error = {
            code: '22P02'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(existingDiscount);
        pgPool.query.onSecondCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid type value", false, 403);
            done();
        });
    });

    it("Sending add discount request with code already exist response", done => {
        const existingDiscount = {
            rowCount: 0,
            rows: []
        }
        const error = {
            code: '23505'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(existingDiscount);
        pgPool.query.onSecondCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Code already exist", false, 403);
            done();
        });
    });

    it("Sending add discount request with failed add new package response", done => {
        const existingDiscount = {
            rowCount: 0,
            rows: []
        }
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(existingDiscount);
        pgPool.query.onSecondCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Failed add new package", false, 404);
            done();
        });
    });

    it("Sending add discount request with partner code not exist response", done => {
        const existingDiscount = {
            rowCount: 0,
            rows: []
        }
        const error = {
            code: '23503'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(existingDiscount);
        pgPool.query.onSecondCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner doesn't exist", false, 403);
            done();
        });
    });

    it("Sending add discount request with valid parameter", done => {
        const existingDiscount = {
            rowCount: 0,
            rows: []
        }
        const queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(existingDiscount);
        pgPool.query.onSecondCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", partnerCode: "AFK", name: "New Year Discount", amount: 100, startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            responseValidator.validateResponse(response, "Discount added", true, 201);
            done();
        });
    });
});
