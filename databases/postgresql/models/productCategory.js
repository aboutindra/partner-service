const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');

class ProductCategory {
    constructor(database) {
        this.database = database
    }

    async insertProductCategory(name) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const insertCategoryQuery = {
            name: 'insert-product-category',
            text: `INSERT INTO public.product_category(
                name, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4)`,
            values: [name, false, new Date(), new Date()]
        }

        try {
            const result = await dbClient.query(insertCategoryQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed to add product category"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Product category already exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async updateProductCategory(id, name, isDeleted, deletedAt) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const updateCategoryQuery = {
            name: 'update-product-category',
            text: `UPDATE public.product_category
                SET name = $2, is_deleted = $3, updated_at = NOW(), deleted_at = $4
                WHERE id = $1`,
            values: [id, name, isDeleted, deletedAt]
        }

        try {
            const result = await dbClient.query(updateCategoryQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Product category not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
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
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getProductCategory(id) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getCategoryQuery = {
            name: 'get-all-product-category',
            text: `SELECT id, name
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
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getProductCategoryById(id) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getCategoryByIdQuery = {
            name: 'get-product-category',
            text: `SELECT id, name, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.product_category
                WHERE id = $1`,
            values: [id]
        }

        try {
            const result = await dbClient.query(getCategoryByIdQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Product category not found"));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = ProductCategory;
