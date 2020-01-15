const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();
const expect = chai.expect;
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/discounts";
const pgPool = require('pg-pool');

chai.use(chaiHttp);

describe("Get Active Discount", _ => {
    let BASE_URL = "/api/v1/active-discount";

    it("Sending get active discount request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get active discount request with active discount not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Active discount not found");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get active discount request with active discount detail response", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "additionDiscountType": "percentage",
                    "additionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Active discount retrieved");
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Discount(s)", _ => {
    it("Sending get all discount with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get all discount with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 2, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get all discount with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get all discount with empty discount list response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Discount(s) not found");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get all discount with empty discount list response", done => {
        let queryResult = {
            rowCount: 0,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "additionDiscountType": "percentage",
                    "additionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
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
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            pool.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Discount(s) retrieved");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get all discount with empty discount list response (using query parameters)", done => {
        let queryResult = {
            rowCount: 0,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "additionDiscountType": "percentage",
                    "additionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
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
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 1})
        .end((error, response) => {
            pool.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Discount(s) retrieved");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get discount with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get discount with empty discount list response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Discount not found");
            expect(response).to.be.json;
            done();
        })
    });

    it("Sending get all discount with empty discount list response", done => {
        let queryResult = {
            rowCount: 0,
            rows: [
                {
                    "code": "NEWYEAR5",
                    "name": "Promo Diskon di Awal Tahun",
                    "deductionDiscountType": "percentage",
                    "deductionDiscountAmount": "50.00",
                    "additionDiscountType": "percentage",
                    "additionDiscountAmount": "50.00",
                    "isActive": false,
                    "startDate": "2019-12-31T17:00:00.000Z",
                    "endDate": "2020-02-28T17:00:00.000Z",
                    "createdAt": "2020-01-03T04:21:36.931Z",
                    "updatedAt": "2020-01-03T07:29:57.561Z",
                    "deactivatedAt": "2020-01-03T07:29:57.561Z"
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Discount(s) retrieved");
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Delete Discount", _ => {
    let PARAMS = 'NEWYEAR5';

    it("Sending delete discount request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();
        
        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .query({ code: 'NEWYEAR5'})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending delete discount request with invalid discount code (code not exist)", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Discount not found");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending delete discount request with valid discount code", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Discount deleted");
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Add Discount", _ => {
    it("Sending add discount request without body", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request without discount code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "fixed", additionDiscountAmount: 100,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request without discount name parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "fixed", additionDiscountAmount: 100,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    
    it("Sending add discount request without deduction discount amount parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', additionDiscountType: "fixed", additionDiscountAmount: 100,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request without addition discount amount parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "fixed",
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with partner code more than 10 characters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEARDISCOUNT5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "fixed", additionDiscountAmount: 100,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with invalid deduction and addition amount", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: -1, additionDiscountType: "fixed", additionDiscountAmount: -1,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with invalid cost type parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'nonfixed', deductionDiscountAmount: 100, additionDiscountType: "zero", additionDiscountAmount: 100,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with invalid date parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'nonfixed', deductionDiscountAmount: 100, additionDiscountType: "zero", additionDiscountAmount: 100,
            startDate: 'AFK', endDate: 'AFK'})
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request when another discount already running", done => {
        let existingDiscount = {
            rowCount: 1,
            rows: [
                {

                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(existingDiscount);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "percentage", additionDiscountAmount: 10,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("There is another program currently running");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with internal server error response", done => {
        let existingDiscount = {
            rowCount: 0,
            rows: []
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(existingDiscount);
        pool.onSecondCall().rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "percentage", additionDiscountAmount: 10,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with invalid type value response", done => {
        let existingDiscount = {
            rowCount: 0,
            rows: []
        }
        let error = {
            code: '22P02'
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(existingDiscount);
        pool.onSecondCall().rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "percentage", additionDiscountAmount: 10,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid type value");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with code already exist response", done => {
        let existingDiscount = {
            rowCount: 0,
            rows: []
        }
        let error = {
            code: '23505'
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(existingDiscount);
        pool.onSecondCall().rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "percentage", additionDiscountAmount: 10,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Code already exist");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with failed add new package response", done => {
        let existingDiscount = {
            rowCount: 0,
            rows: []
        }
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(existingDiscount);
        pool.onSecondCall().resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "percentage", additionDiscountAmount: 10,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Failed add new package");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add discount request with valid parameter", done => {
        let existingDiscount = {
            rowCount: 0,
            rows: []
        }
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        let pool = sandbox.stub(pgPool.prototype, 'query')
        pool.onFirstCall().resolves(existingDiscount);
        pool.onSecondCall().resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: "NEWYEAR5", name: "New Year Discount", deductionDiscountType: 'fixed', deductionDiscountAmount: 100, additionDiscountType: "percentage", additionDiscountAmount: 10,
            startDate: new Date(), endDate: new Date()})
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(201);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Discount added");
            expect(response).to.be.json;
            done();
        });
    });
});