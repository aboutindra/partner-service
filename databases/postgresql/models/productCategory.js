const apm = require('elastic-apm-node');
const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');

class ProductCategory {
    constructor(database) {
        this.database = database
    }

    async insertProductCategory({name, imageUrl}) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const insertCategoryQuery = {
            name: 'insert-product-category',
            text: `INSERT INTO public.product_category(
                name, image_url, is_deleted, created_at, updated_at)
                VALUES ($1, $2, false, NOW(), NOW())`,
            values: [name, imageUrl]
        }

        try {
            const result = await dbClient.query(insertCategoryQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed to add product category"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Product category already exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async updateProductCategory({id, name, imageUrl, isDeleted, deletedAt}) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const updateCategoryQuery = {
            name: 'update-product-category',
            text: `UPDATE public.product_category
                SET name = $2, image_url = $3, is_deleted = $4, updated_at = NOW(), deleted_at = $5
                WHERE id = $1`,
            values: [id, name, imageUrl, isDeleted, deletedAt]
        }

        try {
            const result = await dbClient.query(updateCategoryQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Product category not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Product category already exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async deleteProductCategory(id) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const deleteCategoryQuery = {
            name: 'update-product-category',
            text: `UPDATE public.product_category
                SET is_deleted = true, updated_at = NOW(), deleted_at = NOW()
                WHERE id = $1;`,
            values: [id]
        }

        try {
            const result = await dbClient.query(deleteCategoryQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Product category not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getProductCategory(id) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getCategoryQuery = {
            name: 'get-all-product-category',
            text: `SELECT id, name, image_url AS "imageUrl"
                FROM public.product_category
                WHERE is_deleted = false AND (id = $1 OR $1 is NULL)
                ORDER BY id;`,
            values: [id]
        }

        try {
            const result = await dbClient.query(getCategoryQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Product category(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            console.log(error)
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = ProductCategory;
