const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/packages/acquirers";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Acquirer Package", _ => {
    it("Sending get package request with invalid id parameter (negative number)", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ id: -3 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get package request with invalid id parameter (alphabet)", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ id: 'sys' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get package request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get package request with package not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package not found", false, 404);
            done();
        });
    });

    it("Sending get package request with package detail response", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 1,
                    "name": "Trial",
                    "costType": "fixed",
                    "amount": "300.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:56:37.573Z",
                    "updatedAt": "2019-12-03T08:11:55.468Z",
                    "deletedAt": null
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get Acquirer Packages", () => {
    it("Sending get all packages request with invalid page parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 10 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all packages request with invalid limit parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all packages request with database connection failure (main query)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 10 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all packages request with database connection failure 2 (count query)", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 3,
                    "name": "Basic",
                    "costType": "fixed",
                    "amount": "10.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:57:10.239Z",
                    "updatedAt": "2019-12-21T08:10:39.231Z",
                    "deletedAt": null
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query');
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 10 })
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all packages request with empty package response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        let pool = sandbox.stub(pgPool.prototype, 'query');
        pool.onFirstCall().resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 10 })
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Package(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all packages request with list package response", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 3,
                    "name": "Basic",
                    "costType": "fixed",
                    "amount": "10.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:57:10.239Z",
                    "updatedAt": "2019-12-21T08:10:39.231Z",
                    "deletedAt": null
                },
                {
                    "id": 2,
                    "name": "Trial",
                    "costType": "fixed",
                    "amount": "300.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:56:37.573Z",
                    "updatedAt": "2019-12-03T08:11:55.468Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rows: [
                {
                    counts: 100
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query');
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 2 })
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Package(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all packages request with list package response (without query parameter)", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 3,
                    "name": "Basic",
                    "costType": "fixed",
                    "amount": "10.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:57:10.239Z",
                    "updatedAt": "2019-12-21T08:10:39.231Z",
                    "deletedAt": null
                },
                {
                    "id": 2,
                    "name": "Trial",
                    "costType": "fixed",
                    "amount": "300.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:56:37.573Z",
                    "updatedAt": "2019-12-03T08:11:55.468Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rows: [
                {
                    counts: 100
                }
            ]
        }
        let pool = sandbox.stub(pgPool.prototype, 'query');
        pool.onFirstCall().resolves(queryResult);
        pool.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            pool.restore();
            responseValidator.validateResponse(response, "Package(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Delete Acquirer Package", _ => {
    let PARAMS = 1;
    it("Sending delete acquirer package request with invalid package id (alphabet)", done => {
        let PARAMS = 'SYS';
        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete acquirer package request with invalid package id (negative number)", done => {
        let PARAMS = -2;
        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete acquirer package request with not exist package id", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package not found", false, 404);
            done();
        });
    });

    it("Sending delete acquirer package request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete acquirer package request with valid package id", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package deleted", true, 200);
            done();
        });
    });
});

describe("Update Acquirer Package", _ => {
    let PARAMS = 1;

    it("Sending update acquirer package request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request without package name parameter", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ costType: 'fixed', amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request without cost type parameter", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request without amount parameter", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ costType: 'fixed', name: 'BASIC' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request with invalid amount parameter (negative number)", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request with invalid amount parameter (alphabet)", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: 'sys' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request with invalid cost type parameter", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'empty', amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update acquirer package request with invalid package name parameter (name already exist)", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package name already exist", false, 403);
            done();
        });
    });

    it("Sending update acquirer package request with invalid cost type parameter (non existed type)", done => {
        let error = {
            code: '22P02'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid type value", false, 403);
            done();
        });
    });

    it("Sending update acquirer package request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update acquirer package request with package not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package(s) not found", false, 404);
            done();
        });
    });

    it("Sending update acquirer package request with valid parameter", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package updated", true, 200);
            done();
        });
    });
});

describe("Insert Acquirer Package", _ => {
    it("Sending insert acquirer package request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request without package name parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ costType: 'fixed', amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request without cost type parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request without amount parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ costType: 'fixed', name: 'BASIC' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request with invalid amount parameter (negative number)", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request with invalid amount parameter (alphabet)", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: 'sys' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request with invalid cost type parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'empty', amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert acquirer package request with invalid package name parameter (name already exist)", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package name already exist", false, 403);
            done();
        });
    });

    it("Sending insert acquirer package request with invalid cost type parameter (non existed type)", done => {
        let error = {
            code: '22P02'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid type value", false, 403);
            done();
        });
    });

    it("Sending insert acquirer package request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert acquirer package request with database add row failure", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed add new package", false, 404);
            done();
        });
    });

    it("Sending insert acquirer package request with valid parameter", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', costType: 'fixed', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package added", true, 201);
            done();
        });
    });
});
