const wrapper = require('../utilities/wrapper');
const ProductCategory = require('../databases/postgresql/models/productCategory');
const productCategory = new ProductCategory(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const { BadRequestError } = require('../utilities/error');

const insertProductCategory = async (request, response) => {
    const { name } = request.body;

    const result = await productCategory.insertProductCategory(name);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product category added", successCode.CREATED);
    }
}

const updateProductCategory = async (request, response) => {
    const id = parseInt(request.params.id);
    const { name, isDeleted } = request.body;

    let deletedAt = null;
    if (isDeleted === true) {
        deletedAt = new Date();
    }

    const result = await productCategory.updateProductCategory(id, name, isDeleted, deletedAt);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product category updated", successCode.OK);
    }
}

const deleteProductCategory = async (request, response) => {
    const id = parseInt(request.params.id);

    const result = await productCategory.deleteProductCategory(id);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product category deleted", successCode.OK);
    }
}

const getProductCategory = async (request, response) => {
    const id = request.query.id;
    const result = await productCategory.getProductCategory(id);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Product category(s) retrieved", successCode.OK);
    }
}

module.exports = {
    insertProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductCategory
}
