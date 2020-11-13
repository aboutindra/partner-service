const wrapper = require('../utilities/wrapper');
const Product = require('../databases/postgresql/models/product');
const product = new Product(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../enum/httpStatusCode');

const insertProduct = async (request, response) => {
    const result = await product.insertProduct(request.body);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product added", successCode.OK);
    }
}

const updateProduct = async (request, response) => {
    const payload = request.body;
    const { code } = request.params;

    payload.code = code;

    payload.deletedAt = null;
    if (payload.isDeleted === true) {
        payload.deletedAt = new Date();
    }

    const result = await product.updateProduct(payload);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product updated", successCode.OK);
    }
}

const deleteProduct = async (request, response) => {
    const { code } = request.params;

    const result = await product.deleteProduct(code); 

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product deleted", successCode.OK);
    }
}

const getProducts = async (request, response) => {
    const { code, category } = request.query;
    
    const result = await product.getProducts(code, category);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product(s) retrieved", successCode.OK);
    }
}

const getActiveProducts = async (request, response) => {
    const { code, category, name } = request.query;
    
    const result = await product.getActiveProducts(code, category, name);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product(s) retrieved", successCode.OK);
    }
}


module.exports = {
    insertProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getActiveProducts
}