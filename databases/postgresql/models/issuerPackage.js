const { NotFoundError, InternalServerError, BadRequestError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');

class IssuerPackage {
    constructor(database) {
       this.database = database
    }

    async insertPackage(name, costType, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPackageQuery = {
            name: 'add-new-issuer-package',
            text: `INSERT INTO public.issuer_cost_package(
                name, cost_type, amount, is_deleted, created_at, updated_at)
                VALUES ($1, $2::cost_type, $3, $4, $5, $6);`,
            values: [name, costType, amount, false, new Date(), new Date()]
        }

        try {
            let insertIssuerPackageResult = await dbClient.query(insertPackageQuery);
            if (insertIssuerPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new package"));
            }
            return wrapper.data(insertIssuerPackageResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new ForbiddenError("Invalid type value"));
            }
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Package name already exist"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async updatePackageById(id, name, costType, amount) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updateIssuerPackageQuery = {
            name: 'update-issuer-package',
            text: `UPDATE public.issuer_cost_package
                SET name=$2, cost_type=$3::cost_type, amount=$4, updated_at=$5
                WHERE id = $1;`,
            values: [id, name, costType, amount, new Date()]
        }

        try {
            let updateIssuerPackageResult = await dbClient.query(updateIssuerPackageQuery);
            if (updateIssuerPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }
            return wrapper.data(updateIssuerPackageResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new ForbiddenError("Invalid type value"));
            }
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Package name already exist"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getAllIssuerPackage(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllIssuerPackagesQuery = {
            name: 'get-issuer-cost-package-list',
            text: `SELECT id, name, cost_type AS "costType", amount, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.issuer_cost_package
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-issuer-cost-package-list',
            text: `SELECT COUNT(*)
                FROM public.issuer_cost_package`
        }
        try {
            let getAllIssuerPackagesResult = await dbClient.query(getAllIssuerPackagesQuery);
            if (getAllIssuerPackagesResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package(s) not found"));
            }

            let countAllIssuerPackagesResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllIssuerPackagesResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllIssuerPackagesResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllIssuerPackagesResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getPackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getIssuerPackageByIdQuery = {
            name: 'get-issuer-cost-package',
            text: `SELECT id, name, cost_type AS "costType", amount, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.issuer_cost_package
                WHERE id = $1`,
            values: [id]
        }

        try {
            let getIssuerPackageByIdResult = await dbClient.query(getIssuerPackageByIdQuery);
            if (getIssuerPackageByIdResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(getIssuerPackageByIdResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async softDeletePackageById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deleteIssuerPackageQuery = {
            name: 'soft-delete-issuer-package',
            text: `UPDATE public.issuer_cost_package
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            let deleteIssuerPackageResult = await dbClient.query(deleteIssuerPackageQuery);
            if (deleteIssuerPackageResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Package not found"));
            }
            return wrapper.data(deleteIssuerPackageResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

}

module.exports = IssuerPackage;
