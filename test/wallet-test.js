const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();
const expect = chai.expect;
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/wallets";
const pgPool = require('pg-pool');

chai.use(chaiHttp);

describe("Get Partner Wallet", _ => {
    let PARAMS = "IDH";

    it("Sending get partner wallet request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
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
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner wallet not found");
            expect(response).to.be.json;
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
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner wallet retrieved");
            expect(response).to.be.json;
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
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
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
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Failed to delete partner wallet");
            expect(response).to.be.json;
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
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner wallet deleted");
            expect(response).to.be.json;
            done();
        });
    });
})

describe("Insert or Update Partner Wallet", _ => {
    it("Sending insert or update partner wallet request without body parameters", done => {
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

    it("Sending insert or update partner wallet request without partner code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ walletCode: "1029312031" })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending insert or update partner wallet request without wallet code parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ partnerCode: "IDK" })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
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
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner doesn't exist");
            expect(response).to.be.json;
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
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Failed to add new partner wallet");
            expect(response).to.be.json;
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
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
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
            response.should.have.status(201);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner wallet added");
            expect(response).to.be.json;
            done();
        });
    });
});
