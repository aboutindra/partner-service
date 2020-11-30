const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/packages/";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Cost Package", _ => {
    afterEach(() => {
        sandbox.restore();
    });

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
        sandbox.stub(postgresqlPool, 'getConnection').returns({query: sandbox.stub().rejects()});

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
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(postgresqlPool, 'getConnection').returns({query: sandbox.stub().resolves(queryResult)});

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
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 1,
                    "name": "Trial",
                    "amount": "300.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:56:37.573Z",
                    "updatedAt": "2019-12-03T08:11:55.468Z",
                    "deletedAt": null
                }
            ]
        }
        sandbox.stub(postgresqlPool, 'getConnection').returns({query: sandbox.stub().resolves(queryResult)});

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

describe("Get Cost Packages", () => {
    afterEach(() => {
        sandbox.restore();
    });

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
        sandbox.stub(postgresqlPool, 'getConnection').returns({query: sandbox.stub().rejects()});

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
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 3,
                    "name": "Basic",
                    "amount": "100",
                    "costBearerType": "partner",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:57:10.239Z",
                    "updatedAt": "2019-12-21T08:10:39.231Z",
                    "deletedAt": null
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        pgPool.query.onSecondCall().rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 10 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all packages request with empty package response", done => {
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        pgPool.query.onSecondCall().rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 10 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Package(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all packages request with list package response", done => {
        const queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 3,
                    "name": "Basic",
                    "amount": "100",
                    "costBearerType": "partner",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:57:10.239Z",
                    "updatedAt": "2019-12-21T08:10:39.231Z",
                    "deletedAt": null
                },
                {
                    "id": 2,
                    "name": "Trial",
                    "amount": "0",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:56:37.573Z",
                    "updatedAt": "2019-12-03T08:11:55.468Z",
                    "deletedAt": null
                }
            ]
        }
        const countResult = {
            rows: [
                {
                    counts: 100
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
        .query({ page: 1, limit: 2 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Package(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all packages request with list package response (without query parameter)", done => {
        const queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 3,
                    "name": "Basic",
                    "amount": "10.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:57:10.239Z",
                    "updatedAt": "2019-12-21T08:10:39.231Z",
                    "deletedAt": null
                },
                {
                    "id": 2,
                    "name": "Trial",
                    "amount": "300.00",
                    "isDeleted": false,
                    "createdAt": "2019-12-03T07:56:37.573Z",
                    "updatedAt": "2019-12-03T08:11:55.468Z",
                    "deletedAt": null
                }
            ]
        }
        const countResult = {
            rows: [
                {
                    counts: 100
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
            responseValidator.validateResponse(response, "Package(s) retrieved", true, 200);
            done();
        });
    });
})

describe("Delete Cost Package", _ => {
    const PARAMS = 1;
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending delete cost package request with invalid package id (alphabet)", done => {
        const PARAMS = 'SYS';
        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete cost package request with invalid package id (negative number)", done => {
        const PARAMS = -2;
        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete cost package request with not exist package id", done => {
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package not found", false, 404);
            done();
        });
    });

    it("Sending delete cost package request with database connection failure", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL  + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete cost package request with valid package id", done => {
        const queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package deleted", true, 200);
            done();
        });
    });
});

describe("Update Cost Package", _ => {
    const PARAMS = 1;
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending update cost package request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update cost package request without package name parameter", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update cost package request without amount parameter", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update cost package request with invalid amount parameter (negative number)", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update cost package request with invalid amount parameter (alphabet)", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: 'sys' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update cost package request with invalid package name parameter (name already exist)", done => {
        const error = {
            code: '23505'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package name already exist", false, 403);
            done();
        });
    });

    it("Sending update cost package request with invalid cost type parameter (non existed type)", done => {
        const error = {
            code: '22P02'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid type value", false, 403);
            done();
        });
    });

    it("Sending update cost package request with database connection failure", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update cost package request with package not found response", done => {
        const queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package(s) not found", false, 404);
            done();
        });
    });

    it("Sending update cost package request with valid parameter", done => {
        const queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package updated", true, 200);
            done();
        });
    });
});

describe("Insert Cost Package", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending insert cost package request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert cost package request without package name parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ amount: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert cost package request without amount parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert cost package request with invalid amount parameter (negative number)", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert cost package request with invalid amount parameter (alphabet)", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 'sys' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert cost package request with invalid package name parameter (name already exist)", done => {
        const error = {
            code: '23505'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package name already exist", false, 403);
            done();
        });
    });

    it("Sending insert cost package request with invalid cost type parameter (non existed type)", done => {
        const error = {
            code: '22P02'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid type value", false, 403);
            done();
        });
    });

    it("Sending insert cost package request with database connection failure", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert cost package request with database add row failure", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed add new package", false, 404);
            done();
        });
    });

    it("Sending insert cost package request with valid parameter", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.onFirstCall().resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'BASIC', amount: 100 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Package added", true, 201);
            done();
        });
    });
});
