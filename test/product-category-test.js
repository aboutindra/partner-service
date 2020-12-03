const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/product-categories";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get product category(s)", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all product category with internal server error response", done => {
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
        });
    });

    it("Sending get all product category with product category not found response", done => {
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
            responseValidator.validateResponse(response, "Product category(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all product category with product category list response", done => {
        const queryResult = {
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
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get product category with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get product category with invalid product category id (numeric id)", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ id: -1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product category with invalid product category id (alphabetical id)", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ id: '{ $ne : -1 }' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product category with non exist product category", done => {
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
        .query({ id: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category(s) not found", false, 404);
            done();
        });
    });

    it("Sending get product category with valid product category id", done => {
        const queryResult = {
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
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.resolves(queryResult);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Update product category", _ => {
    const PARAMS = "1";
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending update product category request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update product category request with invalid id parameters", done => {
        const PARAMS = 'afk';

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: "Fintech", isDeleted: false })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update product category request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', imageUrl: "product-categories/Fintech.png", isDeleted: false })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update product category request with existing product category", done => {
        const error = {
            code: '23505'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', imageUrl: "product-categories/Fintech.png", isDeleted: false })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category already exist", false, 403);
            done();
        });
    });

    it("Sending update product category request with non existing product category id", done => {
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
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', imageUrl: "product-categories/Fintech.png", isDeleted: false })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category not found", false, 404);
            done();
        });
    });

    it("Sending update product category request with unique product category name and delete status is false", done => {
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
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', imageUrl: "product-categories/Fintech.png", isDeleted: false })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category updated", true, 200);
            done();
        });
    });

    it("Sending update product category request with unique product category name and delete status is true", done => {
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
        .put(BASE_URL + '/' + PARAMS)
        .send({ name: 'Fintech ', imageUrl: "product-categories/Fintech.png", isDeleted: true })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category updated", true, 200);
            done();
        });
    });
});

describe("Delete product category", _ => {
    const PARAMS = "1";
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending delete product category request with invalid id parameters", done => {
        const PARAMS = 'afk';

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete product category request with internal server error response", done => {
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

    it("Sending delete product category request with non existing product category id", done => {
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
            responseValidator.validateResponse(response, "Product category not found", false, 404);
            done();
        });
    });

    it("Sending delete product category request", done => {
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
            responseValidator.validateResponse(response, "Product category deleted", true, 200);
            done();
        });
    });
});

describe("Insert Product Category", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending insert product category request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert product category request with existing product category name", done => {
        const error = {
            code: '23505'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech', imageUrl: "product-categories/Fintech.png" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category already exist", false, 403);
            done();
        });
    });

    it("Sending insert product category request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send({ name: 'Fintech', imageUrl: "product-categories/Fintech.png" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert product category request with empty result", done => {
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
        .send({ name: 'Fintech', imageUrl: "product-categories/Fintech.png" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Failed to add product category", false, 404);
            done();
        });
    });

    it("Sending insert product category request with unique name", done => {
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
        .send({ name: 'Fintech', imageUrl: "product-categories/Fintech.png" })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product category added", true, 201);
            done();
        });
    });
});
