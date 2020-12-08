const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/products";
const postgresqlPool = require('../databases/postgresql/index');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get product(s)", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all product with internal server error response", done => {
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

    it("Sending get all product with product not found response", done => {
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
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all product with product list response", done => {
        const queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "TMONEYISAT",
                    "name": "INDOSAT",
                    "description": null,
                    "termCondition": null,
                    "nominals": null,
                    "imageUrl": "products/isat.png",
                    "startDate": null,
                    "endDate": null
                },
                {
                    "code": "TMONEYXL",
                    "name": "XL",
                    "description": null,
                    "termCondition": null,
                    "nominals": null,
                    "imageUrl": "products/xl.png",
                    "startDate": null,
                    "endDate": null
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
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get product with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get product with invalid category id", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ categoryId: '{ $ne : -1 }' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product with non exist product", done => {
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
        .query({ code: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get product with valid product id", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "TMONEYISAT",
                    "name": "INDOSAT",
                    "description": null,
                    "termCondition": null,
                    "nominals": null,
                    "imageUrl": "products/isat.png",
                    "startDate": null,
                    "endDate": null
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
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get active product(s)", _ => {
    const BASE_URL = "/api/v1/active-products";
    afterEach(() => {
        sandbox.restore();
    });

    it("Sending get all product with internal server error response", done => {
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

    it("Sending get all product with product not found response", done => {
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
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all product with product list response", done => {
        const queryResult = {
            rowCount: 2,
            rows: [
                {
                    "code": "TMONEYISAT",
                    "name": "INDOSAT",
                    "description": null,
                    "termCondition": null,
                    "nominals": null,
                    "imageUrl": "products/isat.png",
                    "startDate": null,
                    "endDate": null
                },
                {
                    "code": "TMONEYXL",
                    "name": "XL",
                    "description": null,
                    "termCondition": null,
                    "nominals": null,
                    "imageUrl": "products/xl.png",
                    "startDate": null,
                    "endDate": null
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
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get product with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get product with invalid category id", done => {
        chai.request(server)
        .get(BASE_URL)
        .query({ categoryId: '{ $ne : -1 }' })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product with non exist product", done => {
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
        .query({ code: 1 })
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get product with valid product id", done => {
        const queryResult = {
            rowCount: 1,
            rows: [
                {
                    "code": "TMONEYISAT",
                    "name": "INDOSAT",
                    "description": null,
                    "termCondition": null,
                    "nominals": null,
                    "imageUrl": "products/isat.png",
                    "startDate": null,
                    "endDate": null
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
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Update product", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    const PARAMS = "TNMOALXL";
    const BODY = {
        name: "Smartcell",
        categoryId: 1,
        description: null,
        termCondition: null,
        imageUrl: "product/smartcell.png",
        nominal: null,
        startDate: null,
        endDate: null,
        isDeleted: false
    }

    it("Sending update product request without body parameters", done => {
        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update product request with invalid code parameters", done => {
        const PARAMS = 'DJ983JT49MGFHS9004835JDFGSND09GH50UGH';

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending update product request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update product request with existing product", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product already exist", false, 403);
            done();
        });
    });

    it("Sending update product request with invalid category id", done => {
        const error = {
            code: '23503'
        }
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects(error);
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Category doesn't exist", false, 403);
            done();
        });
    });

    it("Sending update product request with non existing product code", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product not found", false, 404);
            done();
        });
    });

    it("Sending update product request with unique product name and delete status is false", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product updated", true, 200);
            done();
        });
    });

    it("Sending update product request with unique product name and delete status is true", done => {
        BODY.isDeleted = true;
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product updated", true, 200);
            done();
        });
    });
});

describe("Delete product", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    let PARAMS = "TMNOYTLSEL";

    it("Sending delete product request with invalid code parameters", done => {
        PARAMS = 'AUFJ783GRG8138b43343fg118HS8E822';

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            PARAMS = '1';
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending delete product request with internal server error response", done => {
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

    it("Sending delete product request with non existing product code", done => {
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
            responseValidator.validateResponse(response, "Product not found", false, 404);
            done();
        });
    });

    it("Sending delete product request", done => {
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
            responseValidator.validateResponse(response, "Product deleted", true, 200);
            done();
        });
    });
});

describe("Insert Product", _ => {
    afterEach(() => {
        sandbox.restore();
    });

    const BODY = {
        code: "TNMOALXL",
        name: "Smartcell",
        categoryId: 1,
        description: null,
        termCondition: null,
        imageUrl: "product/smartcell.png",
        nominal: null,
        startDate: null,
        endDate: null,
        isDeleted: false
    }
    it("Sending insert product request without body parameter", done => {
        chai.request(server)
        .post(BASE_URL)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending insert product request with existing product name", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product already exist", false, 403);
            done();
        });
    });

    it("Sending insert product request with invalid category id", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Category doesn't exist", false, 403);
            done();
        });
    });

    it("Sending insert product request with internal server error response", done => {
        const pgPool = {
            query: sandbox.stub()
        }
        pgPool.query.rejects();
        sandbox.stub(postgresqlPool, 'getConnection').returns(pgPool);

        chai.request(server)
        .post(BASE_URL)
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert product request with empty result", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Failed to add new product", false, 404);
            done();
        });
    });

    it("Sending insert product request with unique name", done => {
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
        .send(BODY)
        .end((error, response) => {
            responseValidator.validateResponse(response, "Product added", true, 201);
            done();
        });
    });
});
