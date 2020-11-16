const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const sandbox = require('sinon').createSandbox();
const BASE_URL = "/api/v1/products";
const pgPool = require('pg-pool');
const responseValidator = require('./responseValidator');

chai.use(chaiHttp);

describe("Get product(s)", _ => {
    it("Sending get all product with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all product with product not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all product with product list response", done => {
        let queryResult = {
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
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get product with internal server error response", done => {
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

    it("Sending get product with invalid category id", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ categoryId: '{ $ne : -1 }' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product with non exist product", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get product with valid product id", done => {
        let queryResult = {
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
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Get active product(s)", _ => {
    const BASE_URL = "/api/v1/active-products";

    it("Sending get all product with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending get all product with product not found response", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get all product with product list response", done => {
        let queryResult = {
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
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });

    it("Sending get product with internal server error response", done => {
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

    it("Sending get product with invalid category id", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .get(BASE_URL)
        .query({ categoryId: '{ $ne : -1 }' })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Invalid input parameter", false, 400);
            done();
        });
    });

    it("Sending get product with non exist product", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ code: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) not found", false, 404);
            done();
        });
    });

    it("Sending get product with valid product id", done => {
        let queryResult = {
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
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .get(BASE_URL)
        .query({ id: 1 })
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product(s) retrieved", true, 200);
            done();
        });
    });
});

describe("Update product", _ => {
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
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending update product request with existing product", done => {
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product already exist", false, 403);
            done();
        });
    });

    it("Sending update product request with invalid category id", done => {
        let error = {
            code: '23503'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Category doesn't exist", false, 403);
            done();
        });
    });

    it("Sending update product request with non existing product code", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product not found", false, 404);
            done();
        });
    });

    it("Sending update product request with unique product name and delete status is false", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product updated", true, 200);
            done();
        });
    });

    it("Sending update product request with unique product name and delete status is true", done => {
        BODY.isDeleted = true;
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .put(BASE_URL + '/' + PARAMS)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product updated", true, 200);
            done();
        });
    });
});

describe("Delete product", _ => {
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
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending delete product request with non existing product code", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product not found", false, 404);
            done();
        });
    });

    it("Sending delete product request", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .delete(BASE_URL + '/' + PARAMS)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product deleted", true, 200);
            done();
        });
    });
});

describe("Insert Product", _ => {
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
        let error = {
            code: '23505'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product already exist", false, 403);
            done();
        });
    });

    it("Sending insert product request with invalid category id", done => {
        let error = {
            code: '23503'
        }
        sandbox.stub(pgPool.prototype, 'query').rejects(error);

        chai.request(server)
        .post(BASE_URL)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Category doesn't exist", false, 403);
            done();
        });
    });

    it("Sending insert product request with internal server error response", done => {
        sandbox.stub(pgPool.prototype, 'query').rejects();

        chai.request(server)
        .post(BASE_URL)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Internal server error", false, 500);
            done();
        });
    });

    it("Sending insert product request with empty result", done => {
        let queryResult = {
            rowCount: 0,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Failed to add new product", false, 404);
            done();
        });
    });

    it("Sending insert product request with unique name", done => {
        let queryResult = {
            rowCount: 1,
            rows: []
        }
        sandbox.stub(pgPool.prototype, 'query').resolves(queryResult);

        chai.request(server)
        .post(BASE_URL)
        .send(BODY)
        .end((error, response) => {
            sandbox.restore();
            responseValidator.validateResponse(response, "Product added", true, 201);
            done();
        });
    });
});
