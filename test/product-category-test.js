const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/product-categories";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get product category(s)", _ => {
    it("Sending get all product category with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all product category with product category not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all product category with product category list response", done => {
        let queryResult = {
            rowCount: 2,
            rows: [
                {
                    "id": 1,
                    "name": "Internet product",
                    "createdAt": "2019-12-03T07:23:05.009Z",
                    "updatedAt": "2019-12-03T07:23:05.009Z"
                },
                {
                    "id": 2,
                    "name": "Electric Token",
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
            responseValidator.validateResponse(response, "Product category(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get product category with internal server error response", done => {
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

    it("Sending get product category with invalid product category id (numeric id)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ id: -1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product category with invalid product category id (alphabetical id)", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ id: '{ $ne : -1 }' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product category with non exist product category", done => {
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
            responseValidator.validateResponse(response, "Product category(s) not found", false, 404);
            done();
        });
    });

    it("Sending get product category with valid product category id", done => {
        let queryResult = {
            rowCount: 1,
            rows: [
                {
                    "id": 1,
                    "name": "Internet Package",
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
            responseValidator.validateResponse(response, "Product category(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Update product category", _ => {
    let PARAMS = "1";

    it("Sending update product category request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update product category request with invalid id parameters", done => {
        PARAMS = 'afk';

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: "Fintech", isDeleted: false })
        .end((error, response) => {
            PARAMS = '1';
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update product category request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', isDeleted: false })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update product category request with existing product category", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', isDeleted: false })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category already exist", false, 403);
            done();
        });
    });

    it("Sending update product category request with non existing product category id", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', isDeleted: false })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category not found", false, 404);
            done();
        });
    });

    it("Sending update product category request with unique product category name and delete status is false", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', isDeleted: false })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category updated", true, 200);
            done();
        });
    });

    it("Sending update product category request with unique product category name and delete status is true", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', isDeleted: true })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category updated", true, 200);
            done();
        });
    });
});

describe("Delete product category", _ => {
    let PARAMS = "1";

    it("Sending delete product category request with invalid id parameters", done => {
        PARAMS = 'afk';

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            PARAMS = '1';
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete product category request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete product category request with non existing product category id", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category not found", false, 404);
            done();
        });
    });

    it("Sending delete product category request", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category deleted", true, 200);
            done();
        });
    });
});

describe("Insert Product Category", _ => {
    it("Sending insert product category request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert product category request with existing product category name", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product category already exist", false, 403);
            done();
        });
    });

    it("Sending insert product category request with internal server error response", done => {
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

    it("Sending insert product category request with empty result", done => {
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
            responseValidator.validateResponse(response, "Failed to add product category", false, 404);
            done();
        });
    });

    it("Sending insert product category request with unique name", done => {
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
            responseValidator.validateResponse(response, "Product category added", true, 201);
            done();
        });
    });
});
