const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/wallets";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get Partner Wallet", _ => {
    let PARAMS = "IDH";

    it("Sending get partner wallet request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get partner wallet request with invalid partner code", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner wallet not found", false, 404);
            done();
        });
    });

    it("Sending get partner wallet request with valid partner code", done => {
        let queryResult = {
            rowCount: 0,
            rows: [
                {
                    "partnerCode": "IDH",
                    "walletCode": "195222671000"
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner wallet retrieved", true, 200);
            done();
        });
    });
});

describe("Delete Partner Wallet", _ => {
    let PARAMS = "IDH";

    it("Sending delete partner wallet request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete partner wallet request with invalid partner code", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed to delete partner wallet", false, 404);
            done();
        });
    });

    it("Sending delete partner wallet request with valid partner code", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner wallet deleted", true, 200);
            done();
        });
    });
})

describe("Insert or Update Partner Wallet", _ => {
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
        let error = {
            code: '23503'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner doesn't exist", false, 403);
            done();
        });
    });

    it("Sending insert or update partner wallet request with invalid partner code parameter", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed to add new partner wallet", false, 404);
            done();
        });
    });

    it("Sending insert or update partner wallet request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert or update partner wallet request with valid partner code parameter", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK", walletCode: "1029312031" })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Partner wallet added", true, 201);
            done();
        });
    });
});
