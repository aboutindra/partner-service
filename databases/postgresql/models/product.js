const apm = require('elastic-apm-node');
const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('..');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');

class Product {
    constructor (database) {
        this.database = database;
    }

    async insertProduct({ code, name, categoryId, description, termCondition, imageUrl, nominals, startDate, endDate }) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const insertProductQuery = {
            name: 'insert-product',
            text: `INSERT INTO public.product(
                code, name, category_id, description, term_condition, image_url, nominals, start_date, end_date, is_deleted, created_at, updated_at, deleted_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, NOW(), NOW(), null);`,
            values: [code, name, categoryId, description, termCondition, imageUrl, nominals, startDate, endDate]
        }

        try {
            const result = await dbClient.query(insertProductQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed to add new product"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Product already exist"));
            }
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Category doesn't exist"));
            }
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async updateProduct({ code, name, categoryId, description, termCondition, imageUrl, nominals, startDate, endDate, isDeleted, deletedAt }) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const updateProductQuery = {
            name: 'update-product',
            text: `UPDATE public.product
                SET name = $2, category_id = $3, description = $4, term_condition = $5, image_url = $6, nominals = $7, start_date = $8, end_date = $9,
                is_deleted = $10, updated_at = NOW(), deleted_at = $11
                WHERE code = $1;`,
            values: [code, name, categoryId, description, termCondition, imageUrl, nominals, startDate, endDate, isDeleted, deletedAt]
        }

        try {
            const result = await dbClient.query(updateProductQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Product not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Product already exist"));
            }
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Category doesn't exist"));
            }
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async deleteProduct(code) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const deleteCategoryQuery = {
            name: 'soft-delete-product',
            text: `UPDATE public.product
                SET is_deleted = true, updated_at = NOW(), deleted_at = NOW()
                WHERE code = $1 AND is_deleted = false;`,
            values: [code]
        }

        try {
            const result = await dbClient.query(deleteCategoryQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Product not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getProducts(code, categoryId) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getProductQuery = {
            name: 'get-product',
            text: `SELECT *
                FROM public.product
                WHERE (code = $1 OR $1 IS NULL) AND (category_id = $2 OR $2 IS NULL)
                ORDER BY created_at DESC;`,
            values: [code, categoryId]
        }

        try {
            const result = await dbClient.query(getProductQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Product(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getActiveProducts(code, categoryId, name) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getProductQuery = {
            name: 'get-active-product',
            text: `SELECT code, name, description, term_condition AS "termCondition", nominals, image_url AS "imageUrl", start_date AS "startDate", end_date AS "endDate"
                FROM public.product
                WHERE is_deleted = false AND (code = $1 OR $1 IS NULL) AND (category_id = $2 OR $2 IS NULL) AND (lower(name) LIKE lower('%' || $3 || '%') OR $3 IS NULL)
                ORDER BY created_at DESC;`,
            values: [code, categoryId, name]
        }

        try {
            const result = await dbClient.query(getProductQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Product(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = Product;
