const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();
const expect = chai.expect;
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/partners";
const pgPool = require('pg-pool');

chai.use(chaiHttp);

describe("Get Active Acquirers", _ => {
    let PARAMS = '/active-acquirers';

    it("Sending get all active acquirers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active acquirers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active acquirers request with connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active acquirers request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active acquirers request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "name": "indihome",
                    "logo": "partner/logo-myindihome.svg",
                    "unit": "Poin"
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
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active acquirers request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "name": "indihome",
                    "logo": "partner/logo-myindihome.svg",
                    "unit": "Poin"
                },
                {
                    "code": "TKS",
                    "name": "telkomsel",
                    "logo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin"
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Active Issuers", _ => {
    let PARAMS = '/active-issuers';

    it("Sending get all active issuers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active issuers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active issuers request with connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active issuers request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active issuers request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "name": "indihome",
                    "logo": "partner/logo-myindihome.svg",
                    "unit": "Poin"
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
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active issuers request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "name": "indihome",
                    "logo": "partner/logo-myindihome.svg",
                    "unit": "Poin"
                },
                {
                    "code": "TKS",
                    "name": "telkomsel",
                    "logo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin"
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Active Acquirer", _ => {
    let PARAMS = '/active-acquirers/LKJ';

    it("Sending get acquirer request with empty acquirer response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Acquirer not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get acquirer request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response.body.data).to.deep.equal([]);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get acquirer request with empty acquirer response", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "LKJ",
                    "costType": "fixed",
                    "costAmount": "15.00",
                    "exchangeRate": 1
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Acquirer retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});
describe("Get Active Issuer", _ => {
    let PARAMS = '/active-issuers/IDH';

    it("Sending get issuer request with empty issuer response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Issuer not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get issuer request with database connection failure", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response.body.data).to.deep.equal([]);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get issuer request with empty issuer response", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "costType": "fixed",
                    "costAmount": "300.00",
                    "exchangeRate": 10,
                    "minimumAmountPerTransaction": null,
                    "maximumAmountPerTransaction": null,
                    "remainingDeductionQuotaPerDay": 99800,
                    "remainingDeductionQuotaPerMonth": null
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Issuer retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Acquirers", done => {
    let PARAMS = '/acquirers';

    it("Sending get all acquirers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all acquirers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all acquirers request with connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all acquirers request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all acquirers request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "INP",
                    "segmentId": 7,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 2,
                    "name": "inpoin",
                    "urlLogo": "partner/inpoin_logo.png",
                    "unit": "Saldo Inpoin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:49:57.828Z",
                    "updatedAt": "2019-12-04T04:03:57.156Z",
                    "deletedAt": null
                },
                {
                    "code": "LKJ",
                    "segmentId": 1,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 3,
                    "name": "linkaja",
                    "urlLogo": "partner/logo-linkaja.svg",
                    "unit": "Saldo Bonus",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T03:22:20.176Z",
                    "updatedAt": "2019-12-04T04:02:19.471Z",
                    "deletedAt": null
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
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 2 })
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all acquirers request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "INP",
                    "segmentId": 7,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 2,
                    "name": "inpoin",
                    "urlLogo": "partner/inpoin_logo.png",
                    "unit": "Saldo Inpoin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:49:57.828Z",
                    "updatedAt": "2019-12-04T04:03:57.156Z",
                    "deletedAt": null
                },
                {
                    "code": "LKJ",
                    "segmentId": 1,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 3,
                    "name": "linkaja",
                    "urlLogo": "partner/logo-linkaja.svg",
                    "unit": "Saldo Bonus",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T03:22:20.176Z",
                    "updatedAt": "2019-12-04T04:02:19.471Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Issuers", _ => {
    let PARAMS = '/issuers';

    it("Sending get all issuers request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all issuers request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all issuers request with connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all issuers request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all issuers request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                },
                {
                    "code": "TKS",
                    "segmentId": 6,
                    "issuerCostPackageId": 3,
                    "acquirerCostPacakgeId": null,
                    "name": "telkomsel",
                    "urlLogo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T06:40:00.013Z",
                    "updatedAt": "2019-12-04T06:40:00.013Z",
                    "deletedAt": null
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
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .query({ page: 1, limit: 2 })
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all issuers request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                },
                {
                    "code": "TKS",
                    "segmentId": 6,
                    "issuerCostPackageId": 3,
                    "acquirerCostPacakgeId": null,
                    "name": "telkomsel",
                    "urlLogo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T06:40:00.013Z",
                    "updatedAt": "2019-12-04T06:40:00.013Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 2
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL + PARAMS)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Active Partners", _ => {
    let BASE_URL = "/api/v1/active-partners";

    it("Sending get all active partners request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active partners request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active partners request with connection failure response", done => {
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

    it("Sending get all active partners request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active partners request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
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
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all active partners request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 4,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                },
                {
                    "code": "INP",
                    "segmentId": 7,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 2,
                    "name": "inpoin",
                    "urlLogo": "partner/inpoin_logo.png",
                    "unit": "Saldo Inpoin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:49:57.828Z",
                    "updatedAt": "2019-12-04T04:03:57.156Z",
                    "deletedAt": null
                },
                {
                    "code": "LKJ",
                    "segmentId": 1,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 3,
                    "name": "linkaja",
                    "urlLogo": "partner/logo-linkaja.svg",
                    "unit": "Saldo Bonus",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T03:22:20.176Z",
                    "updatedAt": "2019-12-04T04:02:19.471Z",
                    "deletedAt": null
                },
                {
                    "code": "TKS",
                    "segmentId": 6,
                    "issuerCostPackageId": 3,
                    "acquirerCostPacakgeId": null,
                    "name": "telkomsel",
                    "urlLogo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T06:40:00.013Z",
                    "updatedAt": "2019-12-04T06:40:00.013Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 4
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Get Partner(s)", _ => {
    it("Sending get all partners request with invalid page query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 0, limit: 100 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all partners request with invalid limit query parameter", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 0 })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all partners request with connection failure response", done => {
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

    it("Sending get all partners request with empty partner list", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        poolStub.resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all partners request with valid query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
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
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ page: 1, limit: 1 })
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get all partners request without query parameter", done => {
        let poolStub = sandbox.stub(pgPool.prototype, 'query');
        let queryResult = {
            rowCount: 4,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                },
                {
                    "code": "INP",
                    "segmentId": 7,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 2,
                    "name": "inpoin",
                    "urlLogo": "partner/inpoin_logo.png",
                    "unit": "Saldo Inpoin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:49:57.828Z",
                    "updatedAt": "2019-12-04T04:03:57.156Z",
                    "deletedAt": null
                },
                {
                    "code": "LKJ",
                    "segmentId": 1,
                    "issuerCostPackageId": null,
                    "acquirerCostPacakgeId": 3,
                    "name": "linkaja",
                    "urlLogo": "partner/logo-linkaja.svg",
                    "unit": "Saldo Bonus",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T03:22:20.176Z",
                    "updatedAt": "2019-12-04T04:02:19.471Z",
                    "deletedAt": null
                },
                {
                    "code": "TKS",
                    "segmentId": 6,
                    "issuerCostPackageId": 3,
                    "acquirerCostPacakgeId": null,
                    "name": "telkomsel",
                    "urlLogo": "partner/logo-telkomsel-poin.svg",
                    "unit": "Poin",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T06:40:00.013Z",
                    "updatedAt": "2019-12-04T06:40:00.013Z",
                    "deletedAt": null
                }
            ]
        }
        let countResult = {
            rowCount: 1,
            rows: [
                {
                    count: 4
                }
            ]
        }
        poolStub.onFirstCall().resolves(queryResult);
        poolStub.onSecondCall().resolves(countResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            poolStub.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "AFK" })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get partner request with empty partner response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "AFK" })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner(s) not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending get partner request with partner detail response", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "IDH",
                    "segmentId": 6,
                    "issuerCostPackageId": 2,
                    "acquirerCostPacakgeId": null,
                    "name": "indihome",
                    "urlLogo": "partner/logo-myindihome.svg",
                    "unit": "Poin",
                    "partnerType": "Issuer",
                    "isDeleted": false,
                    "createdAt": "2019-12-04T02:28:26.181Z",
                    "updatedAt": "2019-12-04T03:21:21.990Z",
                    "deletedAt": null
                }
            ]
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: "IDH" })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner(s) retrieved");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Delete a Partner", _ => {
    let PARAMS = '/IDH';

    it("Sending delete partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending delete partner request with empty partner response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner not found");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending delete partner request with valid partner code", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner deleted");
            expect(response.body.data).to.deep.equal(queryResult.rows);
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Update Partner", _ => {
    let PARAMS = '/IDH';

    it("Sending update partner request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request without name parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request without segment id parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request without url logo parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request without unit parameters", done => {
        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });
    
    it("Sending update partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request with unavaliable foregin key id response", done => {
        let error = {
            code: "23503"
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Id not exist");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request with unavailable partner code response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Partner not found");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending update partner request with valid partner code response", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + PARAMS)
        .send({ name: 'Indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner updated");
            expect(response).to.be.json;
            done();
        });
    });
});

describe("Add New Partner", _ => {
    it("Sending add new partner request without body parameters", done => {
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

    it("Sending add new partner request without code parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request without name parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request without segment id parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request without url logo parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, unit: 'Poin' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request without unit parameters", done => {
        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png' })
        .end((error, response) => {
            response.should.have.status(400);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Invalid input parameter");
            expect(response).to.be.json;
            done();
        });
    });
    
    it("Sending add new partner request with database connection failure response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(500);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Internal server error");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request with unavaliable foregin key id response", done => {
        let error = {
            code: "23503"
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Id not exist");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request with existed partner code parameter", done => {
        let error = {
            code: "23505"
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(403);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Code already exist");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request with inserting data failure", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(404);
            response.body.status.should.equal(false);
            response.body.message.should.equal("Failed add new partner");
            expect(response).to.be.json;
            done();
        });
    });

    it("Sending add new partner request with valid partner code response", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send({ code: 'IDH', name: 'Indihome', segmentId: 1, urlLogo: 'partner/logo/idh-logo.png', unit: 'Poin' })
        .end((error, response) => {
            sandbox.restore();
            response.should.have.status(200);
            response.body.status.should.equal(true);
            response.body.message.should.equal("Partner added");
            expect(response).to.be.json;
            done();
        });
    });
});