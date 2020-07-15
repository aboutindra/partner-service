const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/segments";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Segment(s)", _ => {
    it("Sending get all segment with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all segment with segment not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all segment with segment list response", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 1,
                    "name": "Fintech",
                    "createdAt": "2019-12-03T07:23:05.009Z",
                    "updatedAt": "2019-12-03T07:23:05.009Z"
                },
                {
                    "id": 2,
                    "name": "Airline",
                    "createdAt": "2019-12-03T07:29:51.581Z",
                    "updatedAt": "2019-12-03T07:29:51.581Z"
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get segment with internal server error response", done => {
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

    it("Sending get segment with invalid segment id (numeric id)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ id: -1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Id must be an integer value", false, 400);
            done();
        });
    });

    it("Sending get segment with invalid segment id (alphabetical id)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ id: '{ $ne : -1 }' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Id must be an integer value", false, 400);
            done();
        });
    });

    it("Sending get segment with non exist segment", done => {
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
            responseValidator.validateResponse(response, "Segment not found", false, 404);
            done();
        });
    });

    it("Sending get segment with valid segment id", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 1,
                    "name": "Fintech",
                    "createdAt": "2019-12-03T07:23:05.009Z",
                    "updatedAt": "2019-12-03T07:23:05.009Z"
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Update Segment", _ => {
    let PARAMS = "1";

    it("Sending update segment request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update segment request with invalid id parameters", done => {
        PARAMS = 'afk';

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: "Fintech" })
        .end((error, response) => {
            PARAMS = '1';
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update segment request without segment name parameters", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update segment request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech '})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update segment request with existing segment name", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech '})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment name already exist", false, 403);
            done();
        });
    });

    it("Sending update segment request with non existing segment id", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech '})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment not found", false, 404);
            done();
        });
    });

    it("Sending update segment request with unique segment name", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech '})
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment updated", true, 200);
            done();
        });
    });
});

describe("Insert Segment", _ => {
    it("Sending insert segment request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert segment request with existing segment name", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment name already exist", false, 403);
            done();
        });
    });

    it("Sending insert segment request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert segment request with empty result", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed add new segment", false, 404);
            done();
        });
    });

    it("Sending insert segment request with unique name", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Segment added", true, 201);
            done();
        });
    });
});
