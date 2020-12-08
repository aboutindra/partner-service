const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/wallets";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Partner Wallet", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    const PARAMS = "IDH";

    it("Sending get partner wallet request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get partner wallet request with invalid partner code", done => {
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
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner wallet not found", false, 404);
            done();
        });
    });

    it("Sending get partner wallet request with valid partner code", done => {
        const queryResult = {
            rowCount: 0,
            rows: [
                {
                    "partnerCode": "IDH",
                    "walletCode": "195222671000"
                }
            ]
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner wallet retrieved", true, 200);
            done();
        });
    });
});

describe("Get All Partner Wallets", () => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all partner wallets request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partner wallets request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Page & Limit must be positive integer value", false, 400);
            done();
        });
    });

    it("Sending get all partner wallets request with connection failure response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all partner wallets request with empty partner list", done => {
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
            responseValidator.validateResponse(response, "Partner wallet(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all partner wallets request with valid query parameter", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "partnerCode": "INP",
                    "walletCode": "195293032458"
                }
            ]
        }
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 5
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
            responseValidator.validateResponse(response, "Partner wallet(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get all partner wallets request without query parameter", done => {
        const queryResult = {
            rowCount: 5,
            rows: [
                {
                    "partnerCode": "INP",
                    "walletCode": "195293032458"
                },
                {
                    "partnerCode": "IDH",
                    "walletCode": "195222677109"
                },
                {
                    "partnerCode": "LKJ",
                    "walletCode": "195253128954"
                },
                {
                    "partnerCode": "ELM",
                    "walletCode": "195223979028"
                },
                {
                    "partnerCode": "OMO",
                    "walletCode": "195255339229"
                }
            ]
        }
        const countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 5
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
            responseValidator.validateResponse(response, "Partner wallet(s) retrieved", true, 200);
            done();
        });
    });

});

describe("Delete Partner Wallet", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    const PARAMS = "IDH";

    it("Sending delete partner wallet request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete partner wallet request with invalid partner code", done => {
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
            responseValidator.validateResponse(response, "Failed to delete partner wallet", false, 404);
            done();
        });
    });

    it("Sending delete partner wallet request with valid partner code", done => {
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
            responseValidator.validateResponse(response, "Partner wallet deleted", true, 200);
            done();
        });
    });
})

describe("Insert or Update Partner Wallet", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending insert or update partner wallet request without body parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert or update partner wallet request without partner code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ walletCode: "1029312031" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert or update partner wallet request without wallet code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert or update partner wallet request with invalid partner code parameter", done => {
        const error = {
            code: '23503'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner doesn't exist", false, 403);
            done();
        });
    });

    it("Sending insert or update partner wallet request with invalid partner code parameter", done => {
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
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Failed to add new partner wallet", false, 404);
            done();
        });
    });

    it("Sending insert or update partner wallet request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert or update partner wallet request with valid partner code parameter", done => {
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
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Partner wallet added", true, 201);
            done();
        });
    });
});
